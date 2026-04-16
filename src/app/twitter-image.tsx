import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 600 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          backgroundColor: "#070A12",
          color: "white",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(700px 360px at 25% 20%, rgba(38,230,255,0.22), transparent 62%), radial-gradient(640px 340px at 78% 30%, rgba(46,242,181,0.16), transparent 65%)",
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.14)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: "rgba(46,242,181,1)",
                  boxShadow: "0 0 30px rgba(46,242,181,0.45)",
                }}
              />
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.2 }}>Energiapiloot</div>
          </div>

          <div style={{ fontSize: 54, fontWeight: 700, letterSpacing: -1.1, lineHeight: 1.05 }}>
            Energiaotsused selgelt.
          </div>
          <div style={{ fontSize: 22, opacity: 0.78, maxWidth: 920, lineHeight: 1.45 }}>
            Lepingu analüüs, tarbimine, simulatsioon ja soovitused — selge loogika, ausad eeldused.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

