// app/api/admin/create-note/route.ts
import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import slugify from "slugify";

export const runtime = "nodejs"; // we use fs, so force Node runtime

type Payload = {
  title: string;
  body?: string;
  tags?: string[];
  date?: string; // ISO (YYYY-MM-DD) optional
};

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function POST(req: Request) {
  try {
    // Guard: admin token if configured
    const required = process.env.ADMIN_TOKEN || "";
    if (required) {
      const token = req.headers.get("x-admin-token") ?? "";
      if (token !== required) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const json = (await req.json()) as Partial<Payload>;
    if (!json.title || typeof json.title !== "string") {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const title = json.title.trim();
    const slug = slugify(title, { lower: true, strict: true });
    const date = (json.date && json.date.slice(0, 10)) || ymd(new Date());
    const tags = Array.isArray(json.tags) ? json.tags : [];
    const body = typeof json.body === "string" ? json.body : "";

    const fm = [
      "---",
      `title: "${title.replace(/"/g, '\\"')}"`,
      `slug: "${slug}"`,
      `date: "${date}"`,
      `tags: [${tags.map((t) => `"${t}"`).join(", ")}]`,
      "---",
      "",
      body,
      "",
    ].join("\n");

    const notesDir = path.join(process.cwd(), "content", "notes");
    await fs.mkdir(notesDir, { recursive: true });
    const filePath = path.join(notesDir, `${slug}.md`);
    await fs.writeFile(filePath, fm, "utf8");

    return NextResponse.json({ ok: true, slug, path: `/notes/${slug}` });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json(
      { error: (err as Error).message || "Internal error" },
      { status: 500 }
    );
  }
}
