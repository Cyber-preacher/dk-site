import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import slugify from "slugify";

const NOTES_DIR = path.join(process.cwd(), "content", "notes");
const VALID_TYPES = new Set([
  "note",
  "idea",
  "short",
  "article",
  "post",
  "long",
  "essay",
]);

function isValidYmd(input) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return false;
  const d = new Date(`${input}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return false;
  return d.toISOString().slice(0, 10) === input;
}

function normalizeDateValue(value) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";
    return value.toISOString().slice(0, 10);
  }
  return String(value).trim();
}

function hasBalancedCodeFences(content) {
  const lines = content.split(/\r?\n/);
  let open = null;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    const m = line.match(/^(```+|~~~+)/);
    if (!m) continue;

    const token = m[1];
    const marker = token[0];
    const length = token.length;

    if (!open) {
      open = { marker, length, line: i + 1 };
      continue;
    }

    if (open.marker === marker && length >= open.length) {
      open = null;
    }
  }

  return open;
}

function toSlug(input) {
  return slugify(input, { lower: true, strict: true });
}

function main() {
  if (!fs.existsSync(NOTES_DIR)) {
    console.error(`Missing notes directory: ${NOTES_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(NOTES_DIR)
    .filter((name) => name.endsWith(".md"))
    .sort();

  const errors = [];
  const slugToFile = new Map();

  for (const file of files) {
    const fullPath = path.join(NOTES_DIR, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const rel = path.join("content", "notes", file);

    if (!raw.startsWith("---\n") && !raw.startsWith("---\r\n")) {
      errors.push(`${rel}: missing frontmatter start delimiter (---)`);
      continue;
    }

    let parsed;
    try {
      parsed = matter(raw);
    } catch (error) {
      errors.push(`${rel}: frontmatter parse error (${String(error)})`);
      continue;
    }

    const { data, content } = parsed;

    const title = typeof data.title === "string" ? data.title.trim() : "";
    if (!title) {
      errors.push(
        `${rel}: required frontmatter field 'title' is missing or empty`,
      );
      continue;
    }

    const slugRaw = typeof data.slug === "string" ? data.slug.trim() : "";
    const finalSlug = slugRaw || toSlug(title);

    if (!finalSlug) {
      errors.push(`${rel}: slug cannot be derived from title`);
      continue;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(finalSlug)) {
      errors.push(`${rel}: slug '${finalSlug}' must be lowercase kebab-case`);
    }

    if (slugToFile.has(finalSlug)) {
      errors.push(
        `${rel}: duplicate slug '${finalSlug}' (already used in ${slugToFile.get(finalSlug)})`,
      );
    } else {
      slugToFile.set(finalSlug, rel);
    }

    if (data.date !== undefined) {
      const dateValue = normalizeDateValue(data.date);
      if (!isValidYmd(dateValue)) {
        errors.push(`${rel}: date '${dateValue}' must be valid YYYY-MM-DD`);
      }
    }

    if (data.tags !== undefined) {
      if (
        !Array.isArray(data.tags) ||
        !data.tags.every((tag) => typeof tag === "string")
      ) {
        errors.push(`${rel}: tags must be an array of strings`);
      }
    }

    if (data.type !== undefined) {
      const typeValue = String(data.type).trim().toLowerCase();
      if (!VALID_TYPES.has(typeValue)) {
        errors.push(`${rel}: type '${typeValue}' is invalid`);
      }
    }

    const openFence = hasBalancedCodeFences(content);
    if (openFence) {
      errors.push(
        `${rel}: unclosed code fence starting at content line ${openFence.line}`,
      );
    }
  }

  if (errors.length > 0) {
    console.error("Note validation failed:\n");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`Validated ${files.length} note(s): OK`);
}

main();
