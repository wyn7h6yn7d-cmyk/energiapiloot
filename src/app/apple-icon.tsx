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
            background:
              "radial-gradient(220px 180px at 30% 28%, rgba(38,230,255,0.20), rgba(255,255,255,0.05) 42%, rgba(0,0,0,0.22) 100%)",
            border: "1px solid rgba(255,255,255,0.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 30px 120px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.08)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 84,
              background:
                "radial-gradient(240px 200px at 30% 30%, rgba(38,230,255,0.22), transparent 62%)",
              opacity: 0.85,
            }}
          />

          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 999,
              background: "rgba(0,0,0,0.28)",
              border: "2px solid rgba(38,230,255,0.28)",
              boxShadow: "0 0 60px rgba(38,230,255,0.28), inset 0 1px 0 rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 999,
                background: "rgba(38,230,255,0.92)",
                boxShadow: "0 0 26px rgba(38,230,255,0.55)",
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

