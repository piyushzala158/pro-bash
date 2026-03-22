import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background:
            "radial-gradient(circle at top right, rgba(56,189,248,0.35), transparent 28%), linear-gradient(180deg, #071019 0%, #0c1118 48%, #05080d 100%)",
          color: "#f5f5f4",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 28,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "#a5f3fc",
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 999,
              background: "#86efac",
            }}
          />
          Linux Terminal Practice
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              lineHeight: 1.05,
              maxWidth: 900,
            }}
          >
            Practice Linux and Bash commands in your browser
          </div>
          <div
            style={{
              fontSize: 32,
              lineHeight: 1.4,
              color: "#d6d3d1",
              maxWidth: 900,
            }}
          >
            Guided command line lessons for navigation, files, search, permissions,
            and processes.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 28,
            color: "#e7e5e4",
          }}
        >
          <div>{siteConfig.name}</div>
          <div style={{ color: "#86efac" }}>Browser-based terminal labs</div>
        </div>
      </div>
    ),
    size,
  );
}
