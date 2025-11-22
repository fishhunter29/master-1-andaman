import React from "react";

/**
 * Props:
 * - total: number
 * - lineItems: [{ label, amount }]
 * - badges: [{ label, value }]
 * - onRequestToBook: () => void
 */
function MobileSummaryBar({ total, lineItems = [], badges = [], onRequestToBook }) {
  if (!lineItems.length && !badges.length && !total) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
        padding: "8px 10px",
        background: "rgba(15,23,42,0.96)",
        color: "white",
        boxShadow: "0 -4px 16px rgba(15,23,42,0.65)",
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
            flexDirection: "column",
            gap: 4,
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexWrap: "wrap",
              fontSize: 11,
            }}
          >
            <span
              style={{
                padding: "2px 6px",
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.8)",
                fontWeight: 700,
                letterSpacing: 0.3,
              }}
            >
              TRIP SUMMARY
            </span>
            {badges.map((b) => (
              <span
                key={b.label}
                style={{
                  padding: "2px 6px",
                  borderRadius: 999,
                  background: "rgba(30,64,175,0.8)",
                  fontSize: 10,
                }}
              >
                {b.label}: {b.value}
              </span>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              fontSize: 11,
              color: "#e2e8f0",
            }}
          >
            {lineItems
              .filter((li) => li.amount > 0)
              .map((li) => (
                <span key={li.label}>
                  {li.label}:{" "}
                  <b style={{ color: "white" }}>
                    ₹{Number(li.amount || 0).toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </b>
                </span>
              ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 4,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              padding: "4px 8px",
              borderRadius: 8,
              background: "white",
              color: "#0f172a",
              boxShadow: "0 2px 8px rgba(15,23,42,0.4)",
            }}
          >
            Total:{" "}
            <span>
              ₹{Number(total || 0).toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
          <button
            onClick={onRequestToBook}
            style={{
              fontSize: 12,
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid #22c55e",
              background:
                "linear-gradient(90deg,#22c55e,#16a34a,#15803d)",
              color: "white",
              fontWeight: 700,
            }}
          >
            Request to Book
          </button>
        </div>
      </div>
    </div>
  );
}

export default MobileSummaryBar;
