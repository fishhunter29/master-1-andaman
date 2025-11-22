
import React from "react";

export default function MobileSummaryBar({
  total,
  lineItems = [],
  badges = [],
  onRequestToBook,
}) {
  // ultra-simple: always rendered, CSS hides it on large screens if needed.
  return (
    <div
      className="mobile-summary-bar"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,             // absolutely pinned to viewport bottom
        zIndex: 9999,
        background:
          "linear-gradient(90deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)",
        color: "white",
        padding: "10px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        boxShadow: "0 -4px 16px rgba(15,23,42,0.25)",
        // only show on small screens
        maxWidth: "100vw",
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
            fontSize: 12,
            fontWeight: 800,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.4)",
            padding: "4px 10px",
            background: "rgba(15,23,42,0.15)",
          }}
        >
          TOTAL {total != null ? "• " + new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          }).format(total) : ""}
        </span>
        {badges.map((b) => (
          <span
            key={b.label}
            style={{
              fontSize: 12,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.4)",
              padding: "4px 10px",
              background: "rgba(15,23,42,0.08)",
            }}
          >
            {b.value} {b.label}
          </span>
        ))}
      </div>

      <button
        onClick={onRequestToBook}
        style={{
          borderRadius: 999,
          border: "1px solid white",
          background: "white",
          color: "#0f172a",
          fontWeight: 800,
          fontSize: 12,
          padding: "8px 14px",
          whiteSpace: "nowrap",
        }}
      >
        Request to Book
      </button>
    </div>
  );
}
