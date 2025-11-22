import React from "react";
import { formatINR } from "../utils/formatINR.mjs"; // if you don't have this, you can inline the formatter instead

// If you don't actually have a shared formatter file, replace the import with your own formatter.

export default function MobileSummaryBar({ total, lineItems, badges, onRequestToBook }) {
  const safeFormat =
    typeof formatINR === "function"
      ? formatINR
      : (n) =>
          new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          }).format(Number.isFinite(n) ? n : 0);

  return (
    <div
      style={{
        borderRadius: 999,
        padding: "6px 10px",
        background:
          "linear-gradient(90deg, #0891b2, #06b6d4, #22d3ee)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: "4px 8px",
            borderRadius: 999,
            background: "rgba(15,23,42,0.12)",
          }}
        >
          TOTAL {safeFormat(total)}
        </span>
        {badges?.map((b) => (
          <span
            key={b.label}
            style={{
              fontSize: 11,
              padding: "3px 8px",
              borderRadius: 999,
              background: "rgba(15,23,42,0.16)",
            }}
          >
            {b.value} {b.label}
          </span>
        ))}
      </div>
      <button
        onClick={onRequestToBook}
        style={{
          fontSize: 11,
          padding: "6px 10px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.7)",
          background: "white",
          color: "#0f172a",
          fontWeight: 700,
        }}
      >
        Request
      </button>
    </div>
  );
}
