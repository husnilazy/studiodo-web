import { ImageResponse } from "next/og";

export const alt = "STUDIODO — Platform photobooth untuk pemilik booth";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #eef0ff 0%, #ffe8f1 55%, #e6fbf6 100%)",
          color: "#0b1020",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 52, height: 52, borderRadius: 26, background: "linear-gradient(135deg, #4f4fe8, #9aa6ff)" }} />
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: 2 }}>STUDIODO</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 92, lineHeight: 1.02, letterSpacing: -3, display: "flex", flexDirection: "column" }}>
            <span>Kelola booth foto,</span>
            <span style={{ fontWeight: 700 }}>tanpa ribet.</span>
          </div>
          <div style={{ fontSize: 30, color: "#5b6478" }}>QRIS otomatis · template kreator · galeri cloud · dashboard real-time</div>
        </div>
      </div>
    ),
    size,
  );
}
