import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export async function GET() {
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
          fontSize: 26,
          letterSpacing: 6,
          color: "rgba(255,210,176,.84)",
        }}
      >
        DATONET // ARASAKA DISTRICT
      </div>
      <div
        style={{
          marginTop: 16,
          fontSize: 76,
          fontWeight: 700,
          color: "#fff4ef",
          lineHeight: 1,
        }}
      >
        Dato Kavazi
      </div>
      <div
        style={{ marginTop: 20, fontSize: 28, color: "rgba(177,224,255,0.88)" }}
      >
        Notes, essays, ideas, and systems thinking
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
