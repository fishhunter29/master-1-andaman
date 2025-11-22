// Updated MobileSummaryBar.jsx - sticks flush to bottom on mobile
import React from "react";

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(typeof n === "number" && isFinite(n) ? n : 0);

export default function MobileSummaryBar({
  total,
  lineItems = [],
  badges = [],
  onRequestToBook,
}) {
  // Simple viewport check – render only on small screens
  const isMobile =
    typeof window !== "undefined" ? window.innerWidth <= 900 : true;

  if (!isMobile) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        // ensure it visually touches the device bottom, while padding accounts for safe area
        padding: "10px 16px calc(10px + env(safe-area-inset-bottom, 0px))",
        background:
          "linear-gradient(90deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)",
        color: "white",
        zIndex: 9999,
        boxShadow: "0 -4px 16px rgba(15,23,42,0.25)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.6)",
              background: "rgba(15,23,42,0.16)",
            }}
          >
            TOTAL
          </span>
          {badges.map((b) => (
            <span
              key={b.label}
              style={{
                fontSize: 11,
                padding: "4px 10px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.35)",
                background: "rgba(15,23,42,0.12)",
                whiteSpace: "nowrap",
              }}
            >
              {b.value} {b.label}
            </span>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginLeft: "auto",
          }}
        >
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 11,
                opacity: 0.85,
              }}
            >
              Indicative total
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: 0.2,
              }}
            >
              {formatINR(total)}
            </div>
          </div>
          <button
            onClick={onRequestToBook}
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid rgba(15,23,42,0.1)",
              background: "white",
              color: "#0369a1",
              flexShrink: 0,
            }}
          >
            Request to Book
          </button>
        </div>
      </div>
    </div>
  );
}
