import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          background: "linear-gradient(135deg,#05080c 0%,#0b1220 60%,#091824 100%)",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 24,
            borderRadius: 20,
            border: "2px solid rgba(34,211,238,0.45)",
            boxShadow:
              "0 0 60px rgba(34,211,238,0.35), inset 0 0 40px rgba(34,211,238,0.12)",
          }}
        />
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
            DATO — PERSONAL SITE
          </div>
          <div
            style={{
              fontSize: 72,
              lineHeight: 1.05,
              fontWeight: 900,
              color: "#e6faff",
              textShadow: "0 0 24px rgba(34,211,238,0.25)",
              maxWidth: 1000,
            }}
          >
            Cyber-biz notes, projects & ideas
          </div>
          <div style={{ fontSize: 22, color: "rgba(186,230,253,0.9)" }}>
            Zettelkasten • Humanode • Neurolect
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
