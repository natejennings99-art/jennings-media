import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

export const alt = `${BRAND.name} — ${BRAND.descriptor}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const emblem = `data:image/jpeg;base64,${(await readFile(join(process.cwd(), "public", BRAND.emblem))).toString("base64")}`;
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
          background: "radial-gradient(circle at 85% 15%, #5a2310 0%, #07080a 60%)",
          color: "#f4f1ea",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <img src={emblem} width={84} height={84} style={{ borderRadius: 999 }} alt="" />
          <div style={{ display: "flex", fontSize: 40, fontWeight: 800, letterSpacing: -1, textTransform: "uppercase" }}>
            {BRAND.name}
            <span style={{ color: "#ff5b24" }}>.</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 800, lineHeight: 0.95, letterSpacing: -4, textTransform: "uppercase" }}>We make brands</div>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 800, lineHeight: 0.95, letterSpacing: -4, textTransform: "uppercase" }}>
            impossible to&nbsp;<span style={{ color: "#ff5b24" }}>skip.</span>
          </div>
          <div style={{ marginTop: 30, fontSize: 28, color: "#a9a59c" }}>Social · Film & Photo · Paid Media · Web · AI Automation</div>
        </div>
      </div>
    ),
    size
  );
}
