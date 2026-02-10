import { ImageResponse } from "next/og";
import { getNoteBySlug, isLongForm } from "@/lib/notes";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const note = getNoteBySlug(slug);
  if (!note || !isLongForm(note))
    return new Response("Not found", { status: 404 });

  const { title, date, tags } = note;

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
        {tags?.length ? ` · ${tags.map((t) => `#${t}`).join(" ")}` : ""}
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
