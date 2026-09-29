import { ImageResponse } from "next/og";

export const alt = "Jennings Media — Real Estate Media That Sells the Property";
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
          padding: 72,
          background: "radial-gradient(circle at 80% 20%, #3a2f22 0%, #0b0c0f 55%)",
          color: "#f7f4ee",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#f7f4ee", display: "flex", alignItems: "center", justifyContent: "center", color: "#0b0c0f", fontSize: 34, fontWeight: 700 }}>J</div>
          <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: -1, display: "flex" }}>
            Jennings <span style={{ color: "#e6c998", fontStyle: "italic", fontWeight: 400, marginLeft: 8 }}>Media</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, lineHeight: 1, letterSpacing: -4, fontWeight: 600 }}>Real Estate Media</div>
          <div style={{ fontSize: 84, lineHeight: 1.05, letterSpacing: -4, fontWeight: 600, display: "flex" }}>
            That&nbsp;<span style={{ color: "#e6c998", fontStyle: "italic", fontWeight: 400 }}>Sells</span>&nbsp;the Property.
          </div>
          <div style={{ marginTop: 28, fontSize: 28, color: "#bdb7ad" }}>Photography · Cinematic Video · Drone · 3D Tours · Floor Plans</div>
        </div>
      </div>
    ),
    size
  );
}
