// app/api/admin/create-note/route.ts
import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import slugify from "slugify";

export const runtime = "nodejs";

type NormalizedPayload = {
  title: string;
  slug: string;
  body: string;
  tags: string[];
  date: string;
};

const NOTES_DIR = path.join(process.cwd(), "content", "notes");

class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
}

function parseBasicAuth(request: Request) {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    const base64 = header.slice(6).trim();
    try {
      return Buffer.from(base64, "base64").toString();
    } catch {
      return "";
    }
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === "admin_basic") {
      const value = rest.join("=") ?? "";
      try {
        return Buffer.from(decodeURIComponent(value), "base64").toString();
      } catch {
        return "";
      }
    }
  }

  return "";
}

function assertAuthorized(request: Request) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;

  if (!user || !pass) {
    return;
  }

  const expected = `${user}:${pass}`;
  const provided = parseBasicAuth(request);

  if (provided !== expected) {
    throw new HttpError("Unauthorized", 401);
  }
}

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

function escapeYaml(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function normalizeDate(raw?: string) {
  if (!raw) return ymd(new Date());
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    throw new HttpError("date is invalid (expected ISO YYYY-MM-DD)", 400);
  }
  return ymd(parsed);
}

function normalizeTags(input: unknown): string[] {
  if (!input) return [];

  const tags: string[] = [];
  const push = (value: unknown) => {
    if (typeof value !== "string") return;
    for (const piece of value.split(",")) {
      const tagged = piece.trim();
      if (tagged) tags.push(tagged);
    }
  };

  if (Array.isArray(input)) {
    for (const value of input) push(value);
  } else {
    push(input);
  }

  return tags;
}

function pickBody(record: Record<string, unknown>) {
  for (const key of ["body", "content", "markdown"]) {
    const candidate = record[key];
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }
  return "";
}

function normalizeRecord(raw: unknown): NormalizedPayload {
  if (!raw || typeof raw !== "object") {
    throw new HttpError("payload must be an object", 400);
  }

  const record = raw as Record<string, unknown>;
  const title = typeof record.title === "string" ? record.title.trim() : "";

  if (!title) {
    throw new HttpError("title is required", 400);
  }

  const slugSource =
    typeof record.slug === "string" && record.slug.trim()
      ? record.slug.trim()
      : title;

  const slug = slugify(slugSource, { lower: true, strict: true });
  if (!slug) {
    throw new HttpError("slug could not be derived from title/slug", 400);
  }

  const date = typeof record.date === "string" ? record.date.trim() : undefined;

  return {
    title,
    slug,
    body: pickBody(record),
    tags: normalizeTags(record.tags),
    date: normalizeDate(date),
  };
}

function formDataToRecord(form: FormData) {
  const record: Record<string, unknown> = {};
  for (const [key, value] of form.entries()) {
    if (value instanceof File) continue;
    if (key in record) {
      const current = record[key];
      record[key] = Array.isArray(current) ? [...current, value] : [current, value];
    } else {
      record[key] = value;
    }
  }
  return record;
}

async function readPayload(req: Request) {
  const contentType = req.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.includes("application/json")) {
    try {
      const json = await req.json();
      return normalizeRecord(json);
    } catch {
      throw new HttpError("Invalid JSON body", 400);
    }
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    try {
      const form = await req.formData();
      return normalizeRecord(formDataToRecord(form));
    } catch {
      throw new HttpError("Invalid form payload", 400);
    }
  }

  if (!contentType) {
    try {
      const json = await req.json();
      return normalizeRecord(json);
    } catch {
      throw new HttpError("Unsupported content type", 415);
    }
  }

  throw new HttpError("Unsupported content type", 415);
}

function buildMarkdown(payload: NormalizedPayload) {
  const tagsLine = payload.tags
    .map((tag) => `"${escapeYaml(tag)}"`)
    .join(", ");
  const header = [
    "---",
    `title: "${escapeYaml(payload.title)}"`,
    `slug: "${payload.slug}"`,
    `date: "${payload.date}"`,
    `tags: [${tagsLine}]`,
    "---",
    "",
  ].join("\n");

  const body = payload.body ? `${payload.body}\n` : "";
  return `${header}${body}`;
}

async function writeNote(payload: NormalizedPayload) {
  await fs.mkdir(NOTES_DIR, { recursive: true });
  const filePath = path.join(NOTES_DIR, `${payload.slug}.md`);

  try {
    await fs.writeFile(filePath, buildMarkdown(payload), { flag: "wx" });
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "EEXIST") {
      throw new HttpError("a note with that slug already exists", 409);
    }
    throw error;
  }

  return filePath;
}

export async function POST(req: Request) {
  try {
    assertAuthorized(req);
    const payload = await readPayload(req);
    const filePath = await writeNote(payload);

    return NextResponse.json(
      {
        ok: true,
        slug: payload.slug,
        path: `/notes/${payload.slug}`,
        file: filePath,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
