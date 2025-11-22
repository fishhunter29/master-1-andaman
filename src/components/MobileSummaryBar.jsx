import React, { useEffect, useState } from "react";

// A purely inline-styled, fixed-to-bottom mobile summary bar.
export default function MobileSummaryBar({
  total,
  lineItems = [],
  badges = [],
  onRequestToBook,
}) {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const check = () => {
      if (typeof window === "undefined") return;
      setIsMobile(window.innerWidth <= 900);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!isMobile) return null;

  const formatINR = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(typeof n === "number" && isFinite(n) ? n : 0);

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: "#ffffff",
        borderTop: "1px solid #e5e7eb",
        boxShadow: "0 -6px 18px rgba(15,23,42,0.18)",
        padding: "8px 12px calc(10px + env(safe-area-inset-bottom))",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span
            style={{
              fontSize: 11,
              letterSpacing: 0.25,
              fontWeight: 700,
              color: "#64748b",
            }}
          >
            TRIP TOTAL (indicative)
          </span>
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            {formatINR(total)}
          </span>
        </div>

        <button
          onClick={onRequestToBook}
          style={{
            flexShrink: 0,
            padding: "9px 14px",
            borderRadius: 999,
            border: "1px solid #0ea5e9",
            background:
              "linear-gradient(135deg,#0ea5e9,#06b6d4,#22c55e)",
            color: "white",
            fontSize: 12,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          Request to Book
        </button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          color: "#334155",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          {lineItems
            .filter((l) => (l.amount || 0) > 0)
            .map((l) => (
              <span
                key={l.label}
                style={{
                  padding: "2px 8px",
                  borderRadius: 999,
                  border: "1px solid #e5e7eb",
                  background: "#f8fafc",
                  display: "inline-flex",
                  gap: 4,
                }}
              >
                <span style={{ color: "#64748b" }}>{l.label}:</span>
                <span style={{ fontWeight: 600 }}>
                  {formatINR(l.amount)}
                </span>
              </span>
            ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: 6,
          }}
        >
          {badges.map((b) => (
            <span
              key={b.label}
              style={{
                padding: "2px 8px",
                borderRadius: 999,
                background: "#0ea5e91a",
                color: "#0f172a",
                fontWeight: 600,
                border: "1px solid #0ea5e933",
              }}
            >
              {b.label}: {b.value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
