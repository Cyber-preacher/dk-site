import fs from "node:fs";
import path from "node:path";
import slugify from "slugify";

const NOTES_DIR = path.join(process.cwd(), "content", "notes");

function usage() {
  console.log(
    `Usage: yarn note:new "Title" [--type idea|article|essay] [--tags tag1,tag2] [--status seed|draft|published] [--date YYYY-MM-DD] [--slug custom-slug]`,
  );
}

function isValidYmd(input) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return false;
  const d = new Date(`${input}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return false;
  return d.toISOString().slice(0, 10) === input;
}

function ymdNow() {
  return new Date().toISOString().slice(0, 10);
}

function escapeYaml(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function parseTags(raw) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseArgs(args) {
  const flags = new Map();
  const positional = [];
  const flagsWithValues = new Set([
    "--type",
    "--tags",
    "--status",
    "--date",
    "--slug",
  ]);

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    if (!token.startsWith("--")) {
      positional.push(token);
      continue;
    }

    if (!flagsWithValues.has(token)) {
      console.error(`Unknown flag: ${token}`);
      process.exit(1);
    }

    const value = args[i + 1];
    if (!value || value.startsWith("--")) {
      console.error(`Missing value for flag: ${token}`);
      process.exit(1);
    }

    flags.set(token, value);
    i += 1;
  }

  return { flags, positional };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    usage();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const { flags, positional } = parseArgs(args);
  const title = positional.join(" ").trim();
  if (!title) {
    usage();
    process.exit(1);
  }

  const type = flags.get("--type") || "idea";
  const status = flags.get("--status") || "seed";
  const date = flags.get("--date") || ymdNow();
  const slugInput = flags.get("--slug") || title;
  const slug = slugify(slugInput, { lower: true, strict: true });
  const tags = parseTags(flags.get("--tags"));

  if (!slug) {
    console.error("Could not generate slug from title/--slug");
    process.exit(1);
  }

  if (!isValidYmd(date)) {
    console.error("--date must be a valid YYYY-MM-DD");
    process.exit(1);
  }

  fs.mkdirSync(NOTES_DIR, { recursive: true });
  const filePath = path.join(NOTES_DIR, `${slug}.md`);

  if (fs.existsSync(filePath)) {
    console.error(`Note already exists: ${filePath}`);
    process.exit(1);
  }

  const tagsLine = tags.map((tag) => `"${escapeYaml(tag)}"`).join(",");

  const body = [
    "---",
    `title: \"${escapeYaml(title)}\"`,
    `slug: \"${slug}\"`,
    `date: \"${date}\"`,
    `tags: [${tagsLine}]`,
    `type: \"${escapeYaml(type)}\"`,
    `status: \"${escapeYaml(status)}\"`,
    'excerpt: ""',
    "---",
    "",
    "Write your note here.",
    "",
  ].join("\n");

  fs.writeFileSync(filePath, body, "utf8");
  console.log(`Created ${path.relative(process.cwd(), filePath)}`);
}

main();
