import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Tioga AI — Enterprise AI Implementation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#F5F3EF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "9999px",
              background: "#C83406",
            }}
          />
          <div
            style={{
              fontSize: "28px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "#C83406",
              textTransform: "uppercase",
            }}
          >
            Tioga AI
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 700,
              color: "#221F19",
              lineHeight: 1.15,
              maxWidth: "980px",
            }}
          >
            Enterprise AI, actually connected to your systems.
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "#625D54",
              maxWidth: "900px",
              lineHeight: 1.5,
            }}
          >
            Production-ready AI agents, MCP integrations, and governed automation — built by the founder who gets AI live, not just prototyped.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            height: "6px",
            borderRadius: "9999px",
            background: "linear-gradient(90deg, #C83406, #A50000)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
