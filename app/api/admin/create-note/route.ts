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
    this.name = "HttpError";
    this.status = status;
  }
}

function readAdminToken(req: Request) {
  const headerToken = req.headers.get("x-admin-token")?.trim();
  if (headerToken) return headerToken;

  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return "";

  for (const cookie of cookieHeader.split(";")) {
    const [name, ...rest] = cookie.trim().split("=");
    if (name === "admin_token") {
      return decodeURIComponent(rest.join("=") ?? "");
    }
  }

  return "";
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

function normalizeTags(value: unknown): string[] {
  if (!value) return [];

  const tags: string[] = [];

  const push = (entry: unknown) => {
    if (typeof entry !== "string") return;
    for (const piece of entry.split(",")) {
      const tag = piece.trim();
      if (tag) tags.push(tag);
    }
  };

  if (Array.isArray(value)) {
    for (const entry of value) push(entry);
    return tags;
  }

  push(value);
  return tags;
}

function pickBody(data: Record<string, unknown>) {
  const candidates = ["body", "content", "markdown"];
  for (const key of candidates) {
    const raw = data[key];
    if (typeof raw === "string" && raw.trim()) {
      return raw.trim();
    }
  }
  return "";
}

function normalizeRecord(raw: unknown): NormalizedPayload {
  if (!raw || typeof raw !== "object") {
    throw new HttpError("payload must be an object", 400);
  }

  const data = raw as Record<string, unknown>;
  const title =
    typeof data.title === "string" ? data.title.trim() : "";

  if (!title) {
    throw new HttpError("title is required", 400);
  }

  const slugSource =
    typeof data.slug === "string" && data.slug.trim()
      ? data.slug.trim()
      : title;

  const slug = slugify(slugSource, { lower: true, strict: true });
  if (!slug) {
    throw new HttpError("slug could not be derived from title/slug", 400);
  }

  const dateValue =
    typeof data.date === "string" ? data.date.trim() : undefined;

  return {
    title,
    slug,
    body: pickBody(data),
    tags: normalizeTags(data.tags),
    date: normalizeDate(dateValue),
  };
}

function formDataToRecord(form: FormData) {
  const out: Record<string, unknown> = {};

  for (const [key, value] of form.entries()) {
    if (value instanceof File) continue;

    if (Object.prototype.hasOwnProperty.call(out, key)) {
      const existing = out[key];
      if (Array.isArray(existing)) {
        out[key] = [...existing, value];
      } else {
        out[key] = [existing, value];
      }
    } else {
      out[key] = value;
    }
  }

  return out;
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

function buildMarkdownFile(payload: NormalizedPayload) {
  const tagsLine = payload.tags
    .map((tag) => `"${escapeYaml(tag)}"`)
    .join(", ");

  const frontMatter = [
    "---",
    `title: "${escapeYaml(payload.title)}"`,
    `slug: "${payload.slug}"`,
    `date: "${payload.date}"`,
    `tags: [${tagsLine}]`,
    "---",
    "",
  ].join("\n");

  const body = payload.body ? `${payload.body}\n` : "";

  return `${frontMatter}${body}`;
}

async function writeNote(payload: NormalizedPayload) {
  await fs.mkdir(NOTES_DIR, { recursive: true });

  const filePath = path.join(NOTES_DIR, `${payload.slug}.md`);
  const markdown = buildMarkdownFile(payload);

  try {
    await fs.writeFile(filePath, markdown, { flag: "wx" });
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err && err.code === "EEXIST") {
      throw new HttpError("a note with that slug already exists", 409);
    }
    throw error;
  }

  return filePath;
}

export async function POST(req: Request) {
  try {
    const required = process.env.ADMIN_TOKEN;

    if (required) {
      const token = readAdminToken(req);
      if (token !== required) {
        throw new HttpError("Unauthorized", 401);
      }
    }

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
