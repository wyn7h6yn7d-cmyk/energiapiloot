import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
              "radial-gradient(700px 360px at 20% 15%, rgba(38,230,255,0.22), transparent 62%), radial-gradient(640px 340px at 80% 20%, rgba(46,242,181,0.16), transparent 65%), radial-gradient(640px 380px at 50% 115%, rgba(245,239,196,0.10), transparent 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(700px 420px at 50% 0%, black 35%, transparent 70%)",
            opacity: 0.28,
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
                  background: "rgba(38,230,255,1)",
                  boxShadow: "0 0 30px rgba(38,230,255,0.55)",
                }}
              />
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.2 }}>Energiapiloot</div>
          </div>

          <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: -1.2, lineHeight: 1.05 }}>
            Baltic energy decisions,
            <span style={{ display: "block", opacity: 0.72 }}>simplified.</span>
          </div>

          <div style={{ fontSize: 22, opacity: 0.78, maxWidth: 900, lineHeight: 1.45 }}>
            Contract analysis, consumption insights, investment simulations and actionable recommendations — premium,
            auditable and readable.
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ fontSize: 18, opacity: 0.75 }}>EE • LV • LT</div>
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              fontSize: 18,
              opacity: 0.75,
            }}
          >
            <span>Contracts</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>Simulations</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>Reports</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

