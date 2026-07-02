import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const logoSrc = `data:image/png;base64,${readFileSync(
    path.join(process.cwd(), "public/icon.png"),
  ).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#F5F5E8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img src={logoSrc} width={130} height={130} alt="" />
      </div>
    ),
    { width: 180, height: 180 },
  );
}
