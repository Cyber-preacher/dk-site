// app/og/[slug]/route.ts
import { ImageResponse } from "next/og";
import { getNoteBySlug } from "@/lib/notes";

export const runtime = "edge"; // fast & cheap

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const note = getNoteBySlug(params.slug);

  if (!note) {
    // Minimal 404 image
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0b0f14",
            color: "#e2e8f0",
            fontSize: 42,
            fontWeight: 700,
          }}
        >
          Not found
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const title = note.title.slice(0, 140);
  const subtitle = (note.tags && note.tags.length > 0)
    ? `#${note.tags.join("  #")}`.slice(0, 120)
    : (note.date || "");

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          background: "linear-gradient(135deg,#05080c 0%,#0b1220 60%,#091824 100%)",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
        }}
      >
        {/* Neon frame */}
        <div
          style={{
            position: "absolute",
            inset: 24,
            borderRadius: 20,
            border: "2px solid rgba(34,211,238,0.45)",
            boxShadow: "0 0 60px rgba(34,211,238,0.35), inset 0 0 40px rgba(34,211,238,0.12)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            padding: "64px 84px",
            width: "100%",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "rgba(148,163,184,0.9)",
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            DATO — ZETTELKASTEN
          </div>

          <div
            style={{
              fontSize: 64,
              lineHeight: 1.1,
              fontWeight: 800,
              color: "#e6faff",
              textShadow: "0 0 24px rgba(34,211,238,0.25)",
              maxWidth: 980,
            }}
          >
            {title}
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 24,
              color: "rgba(186,230,253,0.9)",
              maxWidth: 980,
              whiteSpace: "pre-wrap",
            }}
          >
            {subtitle}
          </div>

          <div
            style={{
              marginTop: 12,
              fontSize: 18,
              color: "rgba(148,163,184,0.9)",
            }}
          >
            cyber-biz • humanode • neurolect
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
