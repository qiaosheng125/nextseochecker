import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Vercel SEO Preflight checker preview";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #eef5ff 0%, #f8fbff 48%, #e9f8f1 100%)",
          color: "#142033",
          display: "flex",
          fontFamily: "Inter, Arial, sans-serif",
          height: "100%",
          justifyContent: "center",
          padding: "64px",
          width: "100%"
        }}
      >
        <div
          style={{
            background: "#ffffff",
            border: "2px solid #d8e1ee",
            borderRadius: "26px",
            boxShadow: "0 36px 90px rgba(20, 32, 51, 0.16)",
            display: "flex",
            flexDirection: "column",
            gap: "30px",
            height: "100%",
            justifyContent: "space-between",
            padding: "58px",
            width: "100%"
          }}
        >
          <div style={{ color: "#1550ad", fontSize: "30px", fontWeight: 900 }}>
            Vercel SEO Preflight
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "22px",
              maxWidth: "900px"
            }}
          >
            <div
              style={{
                color: "#0f7b58",
                fontSize: "24px",
                fontWeight: 900,
                textTransform: "uppercase"
              }}
            >
              Next.js SEO Checker
            </div>
            <div
              style={{
                fontSize: "76px",
                fontWeight: 950,
                letterSpacing: "-2px",
                lineHeight: 0.96
              }}
            >
              Check if your Vercel site is ready for Google
            </div>
          </div>
          <div style={{ display: "flex", gap: "18px" }}>
            {["canonical", "robots.txt", "sitemap.xml", "noindex"].map((item) => (
              <div
                key={item}
                style={{
                  background: "#f4f7fb",
                  border: "2px solid #d8e1ee",
                  borderRadius: "16px",
                  color: "#26364d",
                  fontSize: "28px",
                  fontWeight: 850,
                  padding: "16px 22px"
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}
