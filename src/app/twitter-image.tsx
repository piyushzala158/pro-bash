import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site";

export const size = {
  width: 1200,
  height: 600,
};

export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          background:
            "radial-gradient(circle at top left, rgba(134,239,172,0.22), transparent 26%), linear-gradient(180deg, #08111b 0%, #0d1723 100%)",
          color: "#f5f5f4",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            fontSize: 24,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#a5f3fc",
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background: "#86efac",
            }}
          />
          Bash Practice Playground
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.05,
              maxWidth: 900,
            }}
          >
            Learn Linux commands with guided browser labs
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.4,
              color: "#d6d3d1",
              maxWidth: 900,
            }}
          >
            Navigation, files, search, permissions, and process drills with
            terminal-style practice pages.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
          }}
        >
          <div>{siteConfig.name}</div>
          <div style={{ color: "#86efac" }}>twitter-image</div>
        </div>
      </div>
    ),
    size,
  );
}
