import React from "react";

/**
 * MobileSummaryBar
 * - Fixed to bottom of viewport on small screens
 * - Uses safe-area-inset-bottom so it sits exactly on the bottom edge
 * - Does NOT push content up (it's an overlay)
 */
export default function MobileSummaryBar({
  total,
  lineItems = [],
  badges = [],
  onRequestToBook,
}) {
  // Very small guard: don't render on wide screens (desktop)
  if (typeof window !== "undefined" && window.innerWidth >= 900) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        // Use safe area so it hugs the very bottom on iOS/Android
        paddingBottom: "max(6px, env(safe-area-inset-bottom, 0px))",
        paddingTop: 6,
        paddingInline: 10,
        background:
          "linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.12) 10%, rgba(15,23,42,0.35) 100%)",
        pointerEvents: "none", // container is non-interactive
      }}
    >
      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          borderRadius: 999,
          background:
            "linear-gradient(90deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "8px 10px",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.35)",
          pointerEvents: "auto", // inner content is clickable
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.5,
              opacity: 0.9,
            }}
          >
            TOTAL
          </div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>
            ₹{Number(total || 0).toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginTop: 2,
            }}
          >
            {badges.map((b) => (
              <span
                key={b.label}
                style={{
                  fontSize: 10,
                  padding: "2px 6px",
                  borderRadius: 999,
                  background: "rgba(15,23,42,0.18)",
                  border: "1px solid rgba(15,23,42,0.28)",
                }}
              >
                {b.value} {b.label}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={onRequestToBook}
          style={{
            flexShrink: 0,
            borderRadius: 999,
            border: "1px solid rgba(15,23,42,0.1)",
            background: "white",
            color: "#0f172a",
            fontWeight: 800,
            fontSize: 12,
            padding: "8px 12px",
            minWidth: 110,
          }}
        >
          Request to Book
        </button>
      </div>
    </div>
  );
}
