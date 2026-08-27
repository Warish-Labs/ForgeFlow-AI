import { ImageResponse } from "next/og";

// App icon displayed in browser tabs and as favicon
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a6fff 0%, #00d4ff 100%)",
          borderRadius: 8,
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "monospace",
            letterSpacing: "-0.5px",
          }}
        >
          FF
        </span>
      </div>
    ),
    { ...size }
  );
}
