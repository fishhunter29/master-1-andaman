import React from "react";

export default function MobileSummaryBar({
  total,
  lineItems = [],
  badges = [],
  onRequestToBook,
}) {
  // Hide on desktop-wide layouts
  if (typeof window !== "undefined" && window.innerWidth >= 900) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,               // hug the absolute bottom
        zIndex: 50,
        background:
          "linear-gradient(90deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)",
        boxShadow: "0 -6px 20px rgba(15,23,42,0.35)",
        padding: "8px 12px",
        paddingBottom: "calc(8px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              padding: "6px 10px",
              borderRadius: 999,
              background: "rgba(15,23,42,0.15)",
              color: "white",
              letterSpacing: 0.3,
            }}
          >
            TOTAL {total != null ? `• ₹${Number(total).toLocaleString("en-IN")}` : ""}
          </span>

          {badges.map((b) => (
            <span
              key={b.label}
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(15,23,42,0.12)",
                color: "white",
              }}
            >
              {b.value} {b.label}
            </span>
          ))}
        </div>

        <button
          onClick={onRequestToBook}
          style={{
            flexShrink: 0,
            padding: "8px 14px",
            borderRadius: 999,
            border: "1px solid rgba(15,23,42,0.15)",
            background: "white",
            color: "#0f172a",
            fontSize: 12,
            fontWeight: 800,
            boxShadow: "0 2px 10px rgba(15,23,42,0.25)",
          }}
        >
          Request to Book
        </button>
      </div>
    </div>
  );
}
