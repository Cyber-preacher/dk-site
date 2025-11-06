// app/notes/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { getNoteBySlug } from "@/lib/notes";

// We use fs/reading-time inside lib/notes, so use Node runtime.
export const runtime = "nodejs";

// Next auto-uses these for opengraph-image.* files
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// In app dir on Next 15, params is async: await it to avoid warnings.
export default async function OG({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const note = getNoteBySlug(slug);
  const title: string = note?.title ?? "Note not found";
  const date: string = note?.date ?? "";
  const tags: string[] = note?.tags ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background:
            "linear-gradient(135deg,#0b0f1a 0%, #0c1f2e 60%, #0b0f1a 100%)",
          padding: 64,
          position: "relative",
          fontFamily: "Inter, ui-sans-serif, system-ui",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 32,
            borderRadius: 24,
            boxShadow:
              "0 0 0 2px rgba(34,211,238,.5), inset 0 0 80px rgba(236,72,153,.35)",
          }}
        />
        <div style={{ fontSize: 48, fontWeight: 800, color: "white", lineHeight: 1.2 }}>
          {title}
        </div>
        <div style={{ marginTop: 16, fontSize: 24, color: "rgba(255,255,255,0.75)" }}>
          {date}
          {tags.length ? ` · ${tags.map((t: string) => `#${t}`).join(" ")}` : ""}
        </div>
      </div>
    ),
    size
  );
}
