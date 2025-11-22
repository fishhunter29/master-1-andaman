import React from "react";

export default function MobileSummaryBar({
  total,
  lineItems = [],
  badges = [],
  onRequestToBook,
}) {
  if (total == null) return null;

  const containerStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    // visually above main header
    display: "flex",
    justifyContent: "center",
    pointerEvents: "none",
  };

  const barStyle = {
    maxWidth: 480,
    margin: "8px 8px 0 8px",
    padding: "10px 12px",
    borderRadius: 16,
    background:
      "linear-gradient(90deg, rgba(8,145,178,0.98), rgba(6,182,212,0.98), rgba(34,211,238,0.98))",
    color: "white",
    boxShadow: "0 10px 25px rgba(15,23,42,0.35)",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    pointerEvents: "auto",
  };

  const topRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  };

  const tagRowStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    fontSize: 11,
    opacity: 0.9,
  };

  const chipStyle = {
    padding: "2px 6px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.65)",
    background: "rgba(15,23,42,0.18)",
  };

  const listStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    fontSize: 11,
  };

  const itemPillStyle = {
    padding: "3px 7px",
    borderRadius: 999,
    background: "rgba(15,23,42,0.22)",
    border: "1px solid rgba(15,23,42,0.45)",
    whiteSpace: "nowrap",
  };

  const ctaStyle = {
    marginTop: 4,
    width: "100%",
    padding: "7px 10px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.9)",
    background: "white",
    color: "#0f172a",
    fontSize: 13,
    fontWeight: 800,
  };

  return (
    <div className="mobile-summary-top" style={containerStyle}>
      <div style={barStyle}>
        <div style={topRowStyle}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <span
              style={{
                fontSize: 11,
                letterSpacing: 0.8,
                textTransform: "uppercase",
                opacity: 0.9,
              }}
            >
              Trip total (indicative)
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 900,
                textShadow: "0 1px 3px rgba(15,23,42,0.45)",
              }}
            >
              {total}
            </span>
          </div>
          {badges?.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={tagRowStyle}>
                {badges.map((b) => (
                  <span key={b.label} style={chipStyle}>
                    {b.label}: <b>{b.value}</b>
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {lineItems?.length ? (
          <div style={listStyle}>
            {lineItems
              .filter((l) => l.amount > 0)
              .map((l) => (
                <span key={l.label} style={itemPillStyle}>
                  {l.label}: <b>{l.amount}</b>
                </span>
              ))}
          </div>
        ) : null}

        <button
          type="button"
          onClick={onRequestToBook}
          style={ctaStyle}
        >
          Request to Book
        </button>
      </div>
    </div>
  );
}
