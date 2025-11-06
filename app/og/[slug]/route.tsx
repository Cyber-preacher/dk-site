// app/og/[slug]/route.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge"; // required for ImageResponse
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function titleFromSlug(slug: string): string {
  const decoded = decodeURIComponent(slug);
  return decoded
    .split("-")
    .filter(Boolean)
    .map((s) => s[0]?.toUpperCase() + s.slice(1))
    .join(" ");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const title = titleFromSlug(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 64,
          background:
            "linear-gradient(135deg,#05080c 0%,#0b1220 60%,#091824 100%)",
          color: "#e6faff",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI",
        }}
      >
        <div
          style={{
            border: "2px solid rgba(34,211,238,0.6)",
            borderRadius: 24,
            padding: 32,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            boxShadow: "0 0 60px rgba(34,211,238,0.35)",
            background: "rgba(255,255,255,0.05)",
          }}
        >
          <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1 }}>
            {title || "Note"}
          </div>
          <div style={{ fontSize: 24, opacity: 0.85 }}>
            Dato Kavazi — Zettelkasten
          </div>
        </div>
      </div>
    ),
    size
  );
}
