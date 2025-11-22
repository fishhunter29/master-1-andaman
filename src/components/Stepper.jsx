import React from "react";

function Stepper({ step, setStep }) {
  const labels = [
    "Trip Basics",
    "Select Locations",
    "Adventures & Add-ons",
    "Itinerary",
    "Hotels",
    "Transport",
  ];
  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 16px 12px 16px",
        display: "grid",
        gridTemplateColumns: `repeat(${labels.length},1fr)`,
        gap: 6,
      }}
    >
      {labels.map((label, i) => (
        <button
          key={label}
          onClick={() => setStep(i)}
          style={{
            borderRadius: 10,
            padding: "8px 10px",
            border: "1px solid #e5e7eb",
            background: i === step ? "#0ea5e9" : "white",
            color: i === step ? "white" : "#0f172a",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {i + 1}. {label}
        </button>
      ))}
    </div>
  );
}

export default Stepper;
