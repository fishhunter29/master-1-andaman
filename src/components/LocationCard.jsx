import React from "react";

/**
 * Props:
 * - location: normalized location object
 * - selected: boolean
 * - onToggle: () => void
 * - onOpen: () => void
 */
function LocationCard({ location, selected, onToggle, onOpen }) {
  const { image, name, island, durationHrs, moods = [] } = location;

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        background: "white",
        borderRadius: 12,
        padding: 12,
        position: "relative",
      }}
    >
      <div onClick={onOpen} style={{ cursor: "pointer" }}>
        {image ? (
          <div
            style={{
              height: 120,
              borderRadius: 8,
              marginBottom: 8,
              background: `url(${image}) center/cover`,
            }}
          />
        ) : (
          <div
            style={{
              height: 120,
              marginBottom: 8,
              borderRadius: 8,
              background: "linear-gradient(135deg,#bae6fd,#f9fafb)",
            }}
          />
        )}
        <b style={{ fontSize: 14 }}>{name}</b>
        <div
          style={{
            fontSize: 12,
            color: "#64748b",
            marginTop: 4,
          }}
        >
          {island} • {durationHrs}h
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginTop: 6,
          }}
        >
          {moods.slice(0, 3).map((m) => (
            <span
              key={m}
              style={{
                fontSize: 10,
                padding: "2px 6px",
                borderRadius: 999,
                border: "1px solid #e5e7eb",
                color: "#334155",
                background: "#f8fafc",
              }}
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={onToggle}
        style={{
          marginTop: 8,
          width: "100%",
          padding: "8px 10px",
          borderRadius: 8,
          border: "1px solid #0ea5e9",
          background: selected ? "#0ea5e9" : "white",
          color: selected ? "white" : "#0ea5e9",
          fontWeight: 600,
        }}
      >
        {selected ? "Selected" : "Select"}
      </button>
    </div>
  );
}

export default LocationCard;
