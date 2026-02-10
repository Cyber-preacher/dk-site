// app/notes/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { getNoteBySlug, isLongForm } from "@/lib/notes";

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
  if (!note || !isLongForm(note)) {
    return new Response("Not found", { status: 404 });
  }
  const title: string = note.title;
  const date: string = note.date ?? "";
  const tags: string[] = note.tags ?? [];

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background:
          "linear-gradient(140deg,#09090b 0%, #251307 52%, #0a1016 100%)",
        padding: 64,
        position: "relative",
        fontFamily: "Rajdhani, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 32,
          borderRadius: 24,
          border: "2px solid rgba(255,132,41,.56)",
          boxShadow: "inset 0 0 90px rgba(205,87,11,.34)",
        }}
      />
      <div
        style={{
          fontSize: 24,
          letterSpacing: 6,
          color: "rgba(255,210,176,.84)",
        }}
      >
        ARASAKA MEMO // NOTE
      </div>
      <div
        style={{
          marginTop: 14,
          fontSize: 52,
          fontWeight: 700,
          color: "#fff4ef",
          lineHeight: 1.2,
        }}
      >
        {title}
      </div>
      <div
        style={{ marginTop: 16, fontSize: 24, color: "rgba(177,224,255,0.88)" }}
      >
        {date}
        {tags.length ? ` · ${tags.map((t: string) => `#${t}`).join(" ")}` : ""}
      </div>
    </div>,
    size,
  );
}
