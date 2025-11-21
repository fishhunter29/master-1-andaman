import React, { useState, useMemo } from "react";

// Local lookup for basic labels (used for Nearby section).
const LOCATION_META = {
  PB001: { name: "Cellular Jail", island: "Port Blair" },
  PB002: { name: "Corbyn’s Cove Beach", island: "Port Blair" },
  PB003: { name: "Ross Island (Netaji Subhash Chandra Bose Island)", island: "Port Blair" },
  PB004: { name: "North Bay Island (Coral Island)", island: "Port Blair" },
  PB005: { name: "Chidiya Tapu (Sunset Point)", island: "Port Blair" },
  PB006: { name: "Mount Harriet National Park", island: "Port Blair" },
  PB007: { name: "Anthropological Museum", island: "Port Blair" },
  PB008: { name: "Samudrika Naval Marine Museum", island: "Port Blair" },
  PB009: { name: "Aberdeen Jetty & Marina Park", island: "Port Blair" },
  PB010: { name: "Jogger’s Park Viewpoint", island: "Port Blair" },
  HV001: { name: "Radhanagar Beach (Beach No. 7)", island: "Havelock Island" },
  HV002: { name: "Kalapathar Beach", island: "Havelock Island" },
  HV003: { name: "Elephant Beach (via Boat)", island: "Havelock Island" },
  HV004: { name: "Govind Nagar Beach (Havelock Main Beach)", island: "Havelock Island" },
  HV005: { name: "Vijay Nagar Beach (Beach No. 5)", island: "Havelock Island" },
  HV006: { name: "Dive Sites off Havelock (Generic Entry)", island: "Havelock Island" },
  NL001: { name: "Bharatpur Beach", island: "Neil Island" },
  NL002: { name: "Laxmanpur Beach I & II", island: "Neil Island" },
  NL003: { name: "Sitapur Beach (Sunrise Point)", island: "Neil Island" },
  BR001: { name: "Limestone Caves (Baratang)", island: "Baratang Island" },
  BR002: { name: "Mud Volcano (Baratang)", island: "Baratang Island" },
  RG001: { name: "Amkunj Beach (Eco Park)", island: "Rangat & Middle Andaman" },
  RG002: { name: "Dhanninalah Mangrove Walkway", island: "Rangat & Middle Andaman" },
  DG001: { name: "Ross & Smith Twin Islands", island: "Diglipur & North Andaman" },
  DG002: { name: "Saddle Peak National Park (Viewpoint Trek)", island: "Diglipur & North Andaman" },
  DG003: { name: "Kalipur Beach & Turtle Nesting Zone", island: "Diglipur & North Andaman" },
  LA001: { name: "Butler Bay Beach", island: "Little Andaman" },
  LA002: { name: "White Surf & Whisper Wave Waterfalls (Generic Entry)", island: "Little Andaman" },
  LI001: { name: "Long Island Village & Lalaji Bay (Generic Entry)", island: "Long Island" }
};

// Demo adventure mapping per location for UI.
// Later this can be replaced by data from JSON files.
const ADVENTURES_BY_LOCATION = {
  PB001: [
    { id: "ADV_LS_SHOW", name: "Light & Sound Show", type: "Experience" }
  ],
  PB004: [
    { id: "ADV_SNORKEL_NB", name: "Snorkelling at North Bay", type: "Water" },
    { id: "ADV_GB_NB", name: "Glass-bottom Boat Ride", type: "Water" },
    { id: "ADV_SEAWALK_NB", name: "Sea Walk (Helmet)", type: "Water" }
  ],
  HV001: [
    { id: "ADV_SUNSET_PHOTO_RH", name: "Sunset Photography Walk", type: "Experience" }
  ],
  HV003: [
    { id: "ADV_SNORKEL_EB", name: "Snorkelling at Elephant Beach", type: "Water" },
    { id: "ADV_SEAWALK_EB", name: "Sea Walk at Elephant Beach", type: "Water" },
    { id: "ADV_JETSKI_EB", name: "Jet Ski Ride", type: "Adrenaline" }
  ],
  HV006: [
    { id: "ADV_DIVE_FUN", name: "Fun Dives (Certified Divers)", type: "Scuba" },
    { id: "ADV_DSC", name: "Discover Scuba Diving (Beginners)", type: "Scuba" }
  ],
  NL001: [
    { id: "ADV_GB_BH", name: "Glass-bottom Boat at Bharatpur", type: "Water" },
    { id: "ADV_SNORKEL_BH", name: "Snorkelling at Bharatpur", type: "Water" }
  ],
  DG001: [
    { id: "ADV_SWIM_RS", name: "Lagoon Swim at Ross & Smith", type: "Water" },
    { id: "ADV_BOAT_RS", name: "Boat Excursion to Twin Islands", type: "Boat" }
  ]
};

function SectionToggle({ title, count, expanded, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 12px",
        borderRadius: "12px",
        border: "1px solid #E5E7EB",
        background: "#F9FAFB",
        cursor: "pointer",
        marginBottom: expanded ? "8px" : "12px"
      }}
    >
      <div style={{ textAlign: "left" }}>
        <div
          style={{
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "#111827"
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "0.8rem",
            color: "#6B7280"
          }}
        >
          {count > 0 ? `${count} options` : "No options available yet"}
        </div>
      </div>
      <span
        style={{
          fontSize: "1rem",
          color: "#6B7280"
        }}
      >
        {expanded ? "▴" : "▾"}
      </span>
    </button>
  );
}

function PillButton({ active, labelIdle, labelActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        borderRadius: "999px",
        padding: "6px 11px",
        fontSize: "0.8rem",
        fontWeight: 500,
        border: active ? "1px solid #16A34A" : "1px solid #D1D5DB",
        background: active ? "rgba(22,163,74,0.08)" : "#FFFFFF",
        color: active ? "#166534" : "#111827",
        cursor: "pointer"
      }}
    >
      {active ? labelActive : labelIdle}
    </button>
  );
}

function LocationModal({
  location,
  onClose,
  onAddLocation,
  onAddAdventure
}) {
  const [expandedNearby, setExpandedNearby] = useState(false);
  const [expandedAdventures, setExpandedAdventures] = useState(false);
  const [addedNearbyIds, setAddedNearbyIds] = useState({});
  const [addedAdventureIds, setAddedAdventureIds] = useState({});

  if (!location) return null;

  const {
    id,
    name,
    island,
    overview,
    whyGo = [],
    visitTips = [],
    highlights = [],
    bestTime,
    durationSuggested,
    galleryImages = [],
    nearby = []
  } = location;

  const nearbyCards = useMemo(() => {
    return (nearby || [])
      .map((nid) => {
        const meta = LOCATION_META[nid];
        if (!meta) return null;
        return { id: nid, ...meta };
      })
      .filter(Boolean);
  }, [nearby]);

  const adventuresHere = ADVENTURES_BY_LOCATION[id] || [];

  const toggleNearbyAdded = (nid) => {
    setAddedNearbyIds((prev) => ({
      ...prev,
      [nid]: !prev[nid]
    }));
    console.log("Toggle nearby location in trip:", nid);
    if (onAddLocation) onAddLocation();
  };

  const toggleAdventureAdded = (aid) => {
    setAddedAdventureIds((prev) => ({
      ...prev,
      [aid]: !prev[aid]
    }));
    console.log("Toggle adventure in trip:", id, aid);
    if (onAddAdventure) onAddAdventure();
  };

  const nearbyCount = nearbyCards.length;
  const adventuresCount = adventuresHere.length;

  return (
    <div
      className="location-modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.35)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        padding: "12px"
      }}
      onClick={onClose}
    >
      <div
        className="location-modal"
        style={{
          width: "100%",
          maxWidth: "900px",
          height: "70vh",
          background: "#FFFFFF",
          color: "#111827",
          borderRadius: "18px",
          padding: "20px 22px",
          boxShadow: "0 18px 60px rgba(15, 23, 42, 0.30)",
          overflowY: "auto"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "10px",
            gap: "12px"
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "1.35rem",
                fontWeight: 600,
                margin: 0,
                marginBottom: "4px"
              }}
            >
              {name}
            </h2>
            <p
              style={{
                fontSize: "0.9rem",
                margin: 0,
                color: "#6B7280"
              }}
            >
              {island}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              color: "#6B7280",
              fontSize: "1.25rem",
              cursor: "pointer",
              lineHeight: 1
            }}
            aria-label="Close location details"
          >
            ✕
          </button>
        </div>

        {/* Overview */}
        {overview && (
          <section style={{ marginBottom: "12px" }}>
            <h3
              style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                margin: 0,
                marginBottom: "4px"
              }}
            >
              Overview
            </h3>
            <p
              style={{
                fontSize: "0.9rem",
                lineHeight: 1.55,
                margin: 0,
                color: "#4B5563"
              }}
            >
              {overview}
            </p>
          </section>
        )}

        {/* Why you should go */}
        {whyGo.length > 0 && (
          <section style={{ marginBottom: "12px" }}>
            <h3
              style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                margin: 0,
                marginBottom: "4px"
              }}
            >
              Why you should go
            </h3>
            <ul
              style={{
                paddingLeft: "1.1rem",
                margin: 0,
                fontSize: "0.9rem",
                color: "#374151"
              }}
            >
              {whyGo.map((point, idx) => (
                <li key={idx} style={{ marginBottom: "3px" }}>
                  {point}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Highlights + Quick info */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.2fr)",
            gap: "16px",
            marginBottom: "12px"
          }}
        >
          {highlights.length > 0 && (
            <section>
              <h3
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  margin: 0,
                  marginBottom: "4px"
                }}
              >
                Highlights
              </h3>
              <ul
                style={{
                  paddingLeft: "1.1rem",
                  margin: 0,
                  fontSize: "0.9rem",
                  color: "#374151"
                }}
              >
                {highlights.map((h, idx) => (
                  <li key={idx} style={{ marginBottom: "3px" }}>
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section
            style={{
              background: "#F9FAFB",
              borderRadius: "12px",
              padding: "10px 12px",
              border: "1px solid #E5E7EB"
            }}
          >
            <h3
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                margin: 0,
                marginBottom: "4px"
              }}
            >
              Quick info
            </h3>
            <p
              style={{
                fontSize: "0.85rem",
                margin: 0,
                marginBottom: "4px",
                color: "#4B5563"
              }}
            >
              <strong>Best time:</strong>{" "}
              <span style={{ fontWeight: 400 }}>
                {bestTime || "October to May"}
              </span>
            </p>
            <p
              style={{
                fontSize: "0.85rem",
                margin: 0,
                marginBottom: "2px",
                color: "#4B5563"
              }}
            >
              <strong>Suggested duration:</strong>{" "}
              <span style={{ fontWeight: 400 }}>
                {durationSuggested || "1–2 hours"}
              </span>
            </p>
          </section>
        </div>

        {/* Visit tips */}
        {visitTips.length > 0 && (
          <section style={{ marginBottom: "12px" }}>
            <h3
              style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                margin: 0,
                marginBottom: "4px"
              }}
            >
              Visit tips
            </h3>
            <ul
              style={{
                paddingLeft: "1.1rem",
                margin: 0,
                fontSize: "0.9rem",
                color: "#374151"
              }}
            >
              {visitTips.map((tip, idx) => (
                <li key={idx} style={{ marginBottom: "3px" }}>
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Gallery */}
        {galleryImages.length > 0 && (
          <section style={{ marginBottom: "12px" }}>
            <h3
              style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                margin: 0,
                marginBottom: "4px"
              }}
            >
              Gallery
            </h3>
            <div
              style={{
                display: "flex",
                gap: "8px",
                overflowX: "auto"
              }}
            >
              {galleryImages.map((src, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: "0 0 150px",
                    height: "95px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    background: "#E5E7EB",
                    border: "1px solid #E5E7EB"
                  }}
                >
                  <img
                    src={src}
                    alt={`${name} ${idx + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block"
                    }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Collapsible: Nearby attractions */}
        <section style={{ marginBottom: "10px" }}>
          <SectionToggle
            title="Nearby attractions"
            count={nearbyCount}
            expanded={expandedNearby}
            onToggle={() => setExpandedNearby((v) => !v)}
          />
          {expandedNearby && nearbyCount > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginBottom: "10px"
              }}
            >
              {nearbyCards.map((n) => {
                const active = !!addedNearbyIds[n.id];
                return (
                  <div
                    key={n.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 10px",
                      borderRadius: "12px",
                      border: "1px solid #E5E7EB",
                      background: "#FFFFFF"
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 500,
                          color: "#111827",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          maxWidth: "210px"
                        }}
                      >
                        {n.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#6B7280"
                        }}
                      >
                        {n.island}
                      </div>
                    </div>
                    <PillButton
                      active={active}
                      labelIdle="Add to trip"
                      labelActive="Added ✓"
                      onClick={() => toggleNearbyAdded(n.id)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Collapsible: Adventures available here */}
        <section style={{ marginBottom: "12px" }}>
          <SectionToggle
            title="Adventures available here"
            count={adventuresCount}
            expanded={expandedAdventures}
            onToggle={() => setExpandedAdventures((v) => !v)}
          />
          {expandedAdventures && adventuresCount > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginBottom: "10px"
              }}
            >
              {adventuresHere.map((adv) => {
                const active = !!addedAdventureIds[adv.id];
                return (
                  <div
                    key={adv.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 10px",
                      borderRadius: "12px",
                      border: "1px solid #E5E7EB",
                      background: "#FFFFFF"
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 500,
                          color: "#111827"
                        }}
                      >
                        {adv.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#6B7280"
                        }}
                      >
                        {adv.type}
                      </div>
                    </div>
                    <PillButton
                      active={active}
                      labelIdle="Add"
                      labelActive="Added ✓"
                      onClick={() => toggleAdventureAdded(adv.id)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* CTA row */}
        <div
          style={{
            marginTop: "10px",
            paddingTop: "10px",
            borderTop: "1px solid #E5E7EB",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap"
          }}
        >
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={onAddLocation}
              style={{
                border: "none",
                padding: "8px 14px",
                borderRadius: "999px",
                background: "#2563EB",
                color: "#FFFFFF",
                fontSize: "0.9rem",
                fontWeight: 500,
                cursor: "pointer"
              }}
            >
              Add location
            </button>
            <button
              onClick={onAddAdventure}
              style={{
                border: "1px solid #D1D5DB",
                padding: "8px 14px",
                borderRadius: "999px",
                background: "#FFFFFF",
                color: "#111827",
                fontSize: "0.9rem",
                fontWeight: 500,
                cursor: "pointer"
              }}
            >
              Add adventures
            </button>
          </div>

          <button
            onClick={onClose}
            style={{
              border: "none",
              padding: "8px 14px",
              borderRadius: "999px",
              background: "#F3F4F6",
              color: "#374151",
              fontSize: "0.85rem",
              cursor: "pointer"
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default LocationModal;
