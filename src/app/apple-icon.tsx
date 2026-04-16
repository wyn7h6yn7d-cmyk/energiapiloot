import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#070A12",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(320px 240px at 30% 25%, rgba(38,230,255,0.22), transparent 62%), radial-gradient(300px 240px at 70% 60%, rgba(46,242,181,0.16), transparent 65%)",
          }}
        />
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: 84,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.14)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 30px 120px rgba(0,0,0,0.75)",
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 999,
              border: "2px solid rgba(38,230,255,0.55)",
              boxShadow: "0 0 60px rgba(38,230,255,0.35)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 24,
                borderRadius: 999,
                border: "2px solid rgba(46,242,181,0.28)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 52,
                top: 10,
                width: 0,
                height: 0,
                borderLeft: "18px solid transparent",
                borderRight: "18px solid transparent",
                borderBottom: "44px solid rgba(245,239,196,0.9)",
                transform: "skewX(-8deg)",
                filter: "drop-shadow(0 0 18px rgba(245,239,196,0.35))",
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

