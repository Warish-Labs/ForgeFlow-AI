import { ImageResponse } from "next/og";

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
          background: "linear-gradient(135deg, #070a14 0%, #0d1220 100%)",
          border: "1.5px solid #1060ee",
          borderRadius: 8,
          boxShadow: "0 0 10px rgba(16, 96, 238, 0.5)",
        }}
      >
        <span
          style={{
            color: "#38b6ff",
            fontSize: 15,
            fontWeight: 800,
            fontFamily: "sans-serif",
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
