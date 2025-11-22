import React, { useEffect, useMemo, useState } from "react";
import LocationModal from "./components/LocationModal.jsx";

/* -----------------------------------
   Helpers & Normalisers
------------------------------------ */
const safeNum = (n) =>
  typeof n === "number" && isFinite(n) ? n : 0;

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(safeNum(n));

const addDays = (yyyy_mm_dd, n) => {
  if (!yyyy_mm_dd) return null;
  const d = new Date(yyyy_mm_dd);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

// Normalise locations no matter how JSON is shaped
function normalizeLocation(raw) {
  const name = raw.name || raw.location || "Unnamed spot";
  const durationHrs =
    Number.isFinite(raw.durationHrs) ? raw.durationHrs :
    Number.isFinite(raw.typicalHours) ? raw.typicalHours : 2;
  const bestTimes = Array.isArray(raw.bestTimes)
    ? raw.bestTimes
    : raw.bestTime
    ? [raw.bestTime]
    : [];
  const moods = Array.isArray(raw.moods) ? raw.moods : null;
  const image = raw.image || "";

  return {
    ...raw,
    name,
    durationHrs,
    bestTimes,
    moods,
    image,
  };
}

function inferMoods(loc) {
  const moods = new Set();
  const text = `${loc.name || ""} ${loc.brief || ""}`.toLowerCase();
  const dur = Number.isFinite(loc.durationHrs) ? loc.durationHrs : 2;

  if (dur <= 2) moods.add("Relaxed");
  if (dur >= 3) moods.add("Balanced");
  if (dur >= 4) moods.add("Active");

  if (/snorkel|scuba|dive|trek|kayak|surf|jet|parasail|surf/.test(text))
    moods.add("Adventure");
  if (/beach|sunset|view|cove|lagoon|bay|sandbar/.test(text))
    moods.add("Romantic");
  if (/museum|culture|heritage|jail|cellular|memorial|museum/.test(text))
    moods.add("Family");
  if (/wildlife|reef|coral|mangrove|bird|nature|peak|national park/.test(text))
    moods.add("Photography");
  if (/lighthouse|mangrove|cave|long island|mud volcano|baratang|saddle peak|remote/.test(text))
    moods.add("Offbeat");

  if (!moods.size) moods.add("Balanced");
  return Array.from(moods);
}

function normalizeIslandName(rawIsland) {
  if (!rawIsland) return "Port Blair (South Andaman)";
  const s = String(rawIsland).trim();
  if (/^port blair/i.test(s)) return "Port Blair (South Andaman)";
  if (/havelock/i.test(s)) return "Havelock (Swaraj Dweep)";
  if (/neil/i.test(s) || /shaheed dweep/i.test(s)) return "Neil (Shaheed Dweep)";
  if (/long island/i.test(s)) return "Long Island (Middle Andaman)";
  if (/rangat/i.test(s)) return "Rangat (Middle Andaman)";
  if (/mayabunder/i.test(s)) return "Mayabunder (Middle Andaman)";
  if (/diglipur|north andaman/i.test(s)) return "Diglipur (North Andaman)";
  if (/little andaman|hut bay/i.test(s)) return "Little Andaman";
  return s;
}

const DEFAULT_ISLANDS = [
  "Port Blair (South Andaman)",
  "Havelock (Swaraj Dweep)",
  "Neil (Shaheed Dweep)",
  "Long Island (Middle Andaman)",
  "Rangat (Middle Andaman)",
  "Mayabunder (Middle Andaman)",
  "Diglipur (North Andaman)",
  "Little Andaman",
];

const BOAT_BASE_REMOTE = 1200;
const FERRY_BASE_ECON = 1500;
const FERRY_CLASS_MULT = { Economy: 1, Deluxe: 1.4, Luxury: 1.9 };

const CAB_MODELS = [
  {
    id: "sedan",
    label: "Sedan (Dzire / Xcent / Amaze)",
    category: "Comfort",
    dayRate: 2500,
  },
  {
    id: "suv",
    label: "SUV (Ertiga / Carens / Similar)",
    category: "Family",
    dayRate: 3200,
  },
  {
    id: "innova",
    label: "Toyota Innova / Innova Crysta",
    category: "Premium",
    dayRate: 3800,
  },
  {
    id: "traveller",
    label: "Tempo Traveller (12-seater)",
    category: "Group",
    dayRate: 5200,
  },
];

const P2P_RATE_PER_HOP = 500;
const SCOOTER_DAY_RATE = 800;
const BICYCLE_DAY_RATE = 400;

const SEATMAP_URL = "https://seatmap.example.com";

/* -----------------------------------
   Itinerary generator
------------------------------------ */

function orderByBestTime(items) {
  const rank = (it) => {
    const arr = (it.bestTimes || []).map((x) => String(x).toLowerCase());
    if (arr.some((t) => t.includes("morning") || t.includes("sunrise"))) return 0;
    if (arr.some((t) => t.includes("afternoon"))) return 1;
    if (arr.some((t) => t.includes("evening") || t.includes("sunset"))) return 2;
    return 3;
  };
  return [...items].sort((a, b) => rank(a) - rank(b));
}

function isRemoteBoatIsland(islandName) {
  const s = normalizeIslandName(islandName || "");
  return (
    /Baratang/i.test(s) ||
    /Long Island/i.test(s) ||
    /Little Andaman/i.test(s) ||
    /Diglipur/i.test(s) ||
    /North Andaman/i.test(s)
  );
}

function isBoatLeg(fromIsland, toIsland) {
  const a = normalizeIslandName(fromIsland || "");
  const b = normalizeIslandName(toIsland || "");
  if (a === b) return false;
  return isRemoteBoatIsland(a) || isRemoteBoatIsland(b);
}

// Always: Day 1 = arrival at IXZ
// Always: last day = mandatory departure from IXZ
function generateItineraryDays(selectedLocs, selectedActivityIslands, startFromPB = true) {
  const days = [];

  // Day 1: arrival
  days.push({
    island: "Port Blair (South Andaman)",
    items: [
      { type: "arrival", name: "Arrival - Veer Savarkar Intl. Airport (IXZ)" },
      { type: "transfer", name: "Airport → Hotel (Port Blair)" },
    ],
    transport: "Point-to-Point",
  });

  // If nothing selected, still ensure mandatory departure day
  if (!selectedLocs.length && !selectedActivityIslands.size) {
    days.push({
      island: "Port Blair (South Andaman)",
      items: [{ type: "departure", name: "Airport Departure (IXZ) — Fly Out" }],
      transport: "—",
    });
    return days;
  }

  // Collect all islands from locations + activity islands
  const islandSet = new Set();
  selectedLocs.forEach((l) => {
    if (l.island) islandSet.add(normalizeIslandName(l.island));
  });
  selectedActivityIslands.forEach((isl) => {
    if (isl) islandSet.add(normalizeIslandName(isl));
  });

  if (!islandSet.size) islandSet.add("Port Blair (South Andaman)");

  // Build mapping island -> locations
  const byIsland = {};
  selectedLocs.forEach((l) => {
    const isl = normalizeIslandName(l.island);
    if (!byIsland[isl]) byIsland[isl] = [];
    byIsland[isl].push(l);
  });

  // Visiting order using DEFAULT_ISLANDS as reference
  let order = Array.from(islandSet).sort((a, b) => {
    const ia = DEFAULT_ISLANDS.indexOf(a);
    const ib = DEFAULT_ISLANDS.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

  const pbName = "Port Blair (South Andaman)";
  if (startFromPB) {
    if (order.includes(pbName)) {
      order = [pbName, ...order.filter((x) => x !== pbName)];
    } else {
      order = [pbName, ...order];
    }
  }

  const maxHoursPerDay = 7;

  const pushLocationBucketsForIsland = (isl, locs) => {
    const sorted = orderByBestTime(locs || []);
    const buckets = [];

    let bucket = [];
    let timeUsed = 0;

    const pushBucket = () => {
      if (!bucket.length) return;
      buckets.push(bucket);
      bucket = [];
      timeUsed = 0;
    };

    const pushItem = (loc, dur) => {
      const duration = Number.isFinite(dur) ? dur : 2;
      const would = timeUsed + duration;
      if (bucket.length >= 5 || would > maxHoursPerDay) pushBucket();
      bucket.push({
        type: "location",
        ref: loc.id,
        name: loc.name,
        durationHrs: duration,
        bestTimes: loc.bestTimes || [],
      });
      timeUsed += duration;
    };

    sorted.forEach((loc) => {
      const dur = Number.isFinite(loc.durationHrs) ? loc.durationHrs : 2;
      pushItem(loc, dur);
    });
    pushBucket();

    buckets.forEach((items) => {
      days.push({
        island: isl,
        items,
        transport:
          items.filter((it) => it.type === "location").length >= 3
            ? "Cab (full day)"
            : /Havelock|Neil/.test(isl)
            ? "Scooter"
            : "Point-to-Point",
      });
    });
  };

  for (let idx = 0; idx < order.length; idx++) {
    const island = order[idx];
    const locs = byIsland[island] || [];
    if (locs.length) pushLocationBucketsForIsland(island, locs);

    const nextIsland = order[idx + 1];
    if (nextIsland && nextIsland !== island) {
      const boat = isBoatLeg(island, nextIsland);
      days.push({
        island,
        items: [
          {
            type: boat ? "boat" : "ferry",
            name: `${boat ? "Boat" : "Ferry"} ${island} → ${nextIsland}`,
            time: "08:00–09:30",
          },
        ],
        transport: "—",
      });
    }
  }

  const lastIsland = days[days.length - 1]?.island;
  if (lastIsland && lastIsland !== pbName) {
    const boat = isBoatLeg(lastIsland, pbName);
    days.push({
      island: lastIsland,
      items: [
        {
          type: boat ? "boat" : "ferry",
          name: `${boat ? "Boat" : "Ferry"} ${lastIsland} → ${pbName}`,
        },
      ],
      transport: "—",
    });
  }

  days.push({
    island: pbName,
    items: [{ type: "departure", name: "Airport Departure (IXZ) — Fly Out" }],
    transport: "—",
  });

  return days;
}

/* -----------------------------------
   Main App component
------------------------------------ */

export default function App() {
  // Data state
  const [rawLocations, setRawLocations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [locAdventures, setLocAdventures] = useState([]);
  const [dataStatus, setDataStatus] = useState("loading");

  // Trip basics
  const [step, setStep] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [adults, setAdults] = useState(2);
  const [infants, setInfants] = useState(0);
  const [startPB, setStartPB] = useState(true);

  // Location selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [islandFilter, setIslandFilter] = useState("All");
  const [moodFilter, setMoodFilter] = useState("All");

  // Itinerary / transport
  const [days, setDays] = useState([]);
  const [scooterIslands, setScooterIslands] = useState(() => new Set());
  const [bicycleIslands, setBicycleIslands] = useState(() => new Set());
  const [chosenHotels, setChosenHotels] = useState({});
  const [essentials, setEssentials] = useState({
    ferryClass: "Deluxe",
    cabModelId: CAB_MODELS[1].id,
  });

  // Adventures
  const [addonIds, setAddonIds] = useState([]);

  // Location modal
  const [openLoc, setOpenLoc] = useState(null);

  // Mobile detection (for header summary bar)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Load JSON
  useEffect(() => {
    const withTimeout = (promise, ms, label) =>
      Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error(`${label} timed out after ${ms}ms`)),
            ms
          )
        ),
      ]);

    const fetchJSON = async (path, label) => {
      try {
        const res = await withTimeout(fetch(path, { cache: "no-store" }), 8000, label);
        if (!res.ok) throw new Error(`${label} ${res.status} ${res.statusText}`);
        return res.json();
      } catch (e) {
        console.error(`[data] ${label} failed:`, e);
        return null;
      }
    };

    (async () => {
      try {
        const [locs, acts, map] = await Promise.all([
          fetchJSON("/data/locations.json", "locations"),
          fetchJSON("/data/activities.json", "activities"),
          fetchJSON("/data/location_adventures.json", "location_adventures"),
        ]);

        const safeLocs = Array.isArray(locs) ? locs.map(normalizeLocation) : [];
        const safeActs = Array.isArray(acts) ? acts : [];
        const safeMap = Array.isArray(map) ? map : [];

        setRawLocations(safeLocs);
        setActivities(safeActs);
        setLocAdventures(safeMap);
        setDataStatus("ready");
      } catch (e) {
        console.error("Data load fatal error:", e);
        setDataStatus("error");
      }
    })();
  }, []);

  const locations = useMemo(
    () =>
      rawLocations.map((l) => ({
        ...l,
        island: normalizeIslandName(l.island),
        moods: Array.isArray(l.moods) && l.moods.length ? l.moods : inferMoods(l),
      })),
    [rawLocations]
  );

  const islandsList = useMemo(() => {
    const s = new Set(locations.map((l) => l.island).filter(Boolean));
    return s.size ? Array.from(s) : DEFAULT_ISLANDS;
  }, [locations]);

  const selectableLocations = useMemo(
    () =>
      locations.filter(
        (l) => !/airport/i.test(l.name || "")
      ),
    [locations]
  );

  const filteredLocations = useMemo(
    () =>
      selectableLocations.filter(
        (l) =>
          (islandFilter === "All" || l.island === islandFilter) &&
          (moodFilter === "All" ||
            (Array.isArray(l.moods) && l.moods.includes(moodFilter)))
      ),
    [selectableLocations, islandFilter, moodFilter]
  );

  const selectedLocs = useMemo(
    () => locations.filter((l) => selectedIds.includes(l.id)),
    [locations, selectedIds]
  );

  // Itinerary auto-generate whenever locations / activities / startPB change
  useEffect(() => {
    const selectedActivities = activities.filter((a) => addonIds.includes(a.id));
    const activityIslands = new Set();
    selectedActivities.forEach((a) => {
      (a.operatedIn || a.islands || []).forEach((isl) => {
        if (isl) activityIslands.add(normalizeIslandName(isl));
      });
    });
    setDays(generateItineraryDays(selectedLocs, activityIslands, startPB));
  }, [selectedLocs, activities, addonIds, startPB]);

  // Day tools
  const addEmptyDayAfter = (index) => {
    setDays((prev) => {
      const copy = [...prev];
      const baseIsland = copy[index]?.island || "Port Blair (South Andaman)";
      copy.splice(index + 1, 0, {
        island: baseIsland,
        items: [],
        transport: "Point-to-Point",
      });
      return copy;
    });
  };

  const deleteDay = (index) => {
    setDays((prev) => {
      if (prev.length <= 1) return prev;
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  };

  const moveItem = (fromDay, itemIdx, dir = 1) => {
    setDays((prev) => {
      const toDay = fromDay + dir;
      if (toDay < 0 || toDay >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy[fromDay].items.splice(itemIdx, 1);
      copy[toDay].items.push(item);
      return copy;
    });
  };

  const setTransportForDay = (i, mode) => {
    setDays((prev) => {
      const copy = [...prev];
      copy[i] = { ...copy[i], transport: mode };
      return copy;
    });
  };

  // Hotels logic
  const nightsByIsland = useMemo(() => {
    const map = {};
    days.forEach((day) => {
      const hasFerry = day.items.some((i) => i.type === "ferry");
      const hasDeparture = day.items.some((i) => i.type === "departure");
      if (hasFerry || hasDeparture) return;
      map[day.island] = (map[day.island] || 0) + 1;
    });
    return map;
  }, [days]);

  const MOCK_HOTELS = useMemo(
    () => ({
      "Port Blair (South Andaman)": [
        { id: "pb_h1", name: "PB Value Hotel", tier: "Value", sell_price: 3299 },
        { id: "pb_h2", name: "PB Mid Hotel", tier: "Mid", sell_price: 5499 },
        { id: "pb_h3", name: "PB Premium Hotel", tier: "Premium", sell_price: 8899 },
      ],
      "Havelock (Swaraj Dweep)": [
        { id: "hl_h1", name: "HL Value Hotel", tier: "Value", sell_price: 4499 },
        { id: "hl_h2", name: "HL Mid Hotel", tier: "Mid", sell_price: 6999 },
        { id: "hl_h3", name: "HL Premium Hotel", tier: "Premium", sell_price: 10999 },
      ],
      "Neil (Shaheed Dweep)": [
        { id: "nl_h1", name: "NL Value Hotel", tier: "Value", sell_price: 3399 },
        { id: "nl_h2", name: "NL Mid Hotel", tier: "Mid", sell_price: 5699 },
      ],
      "Long Island (Middle Andaman)": [
        { id: "li_h1", name: "LI Mid Hotel", tier: "Mid", sell_price: 6199 },
      ],
      "Rangat (Middle Andaman)": [
        { id: "rg_h1", name: "Rangat Lodge", tier: "Value", sell_price: 2599 },
      ],
      "Mayabunder (Middle Andaman)": [
        { id: "mb_h1", name: "Mayabunder Stay", tier: "Value", sell_price: 2399 },
      ],
      "Diglipur (North Andaman)": [
        { id: "dg_h1", name: "DG Lodge", tier: "Value", sell_price: 2899 },
      ],
      "Little Andaman": [
        { id: "la_h1", name: "Hut Stay", tier: "Value", sell_price: 2199 },
      ],
    }),
    []
  );

  const chooseHotel = (island, hotelId) =>
    setChosenHotels((prev) => ({ ...prev, [island]: hotelId }));

  const suggestedActivities = useMemo(() => {
    const selectedSet = new Set(selectedIds);

    const mappedIds = new Set();
    locAdventures.forEach((m) => {
      const locId = m.locationId || m.location_id;
      const advList = m.adventureIds || m.adventure_ids || [];
      if (locId && selectedSet.has(locId)) {
        advList.forEach((id) => mappedIds.add(id));
      }
    });

    const mapped = activities.filter((a) => mappedIds.has(a.id));
    if (mapped.length) return mapped;

    const selectedIslands = new Set(selectedLocs.map((l) => l.island));
    const islandMatch = activities.filter((a) =>
      (a.islands || []).some((i) => selectedIslands.has(i))
    );
    return islandMatch.length ? islandMatch : activities;
  }, [activities, selectedIds, selectedLocs, locAdventures]);

  // Costs
  const hotelsTotal = useMemo(() => {
    let sum = 0;
    Object.entries(nightsByIsland).forEach(([island, nights]) => {
      const hid = chosenHotels[island];
      if (!hid) return;
      const hotel = (MOCK_HOTELS[island] || []).find((h) => h.id === hid);
      if (hotel) sum += safeNum(hotel.sell_price) * nights;
    });
    return sum;
  }, [nightsByIsland, chosenHotels, MOCK_HOTELS]);

  const addonsTotal = useMemo(
    () =>
      addonIds.reduce((acc, id) => {
        const ad = activities.find((a) => a.id === id);
        return acc + safeNum(ad?.basePriceINR ?? ad?.price);
      }, 0),
    [addonIds, activities]
  );

  const ferryLegCount = useMemo(
    () =>
      days.reduce(
        (acc, d) => acc + d.items.filter((i) => i.type === "ferry").length,
        0
      ),
    [days]
  );

  const boatLegCount = useMemo(
    () =>
      days.reduce(
        (acc, d) => acc + d.items.filter((i) => i.type === "boat").length,
        0
      ),
    [days]
  );

  const ferryTotal = useMemo(() => {
    const mult = FERRY_CLASS_MULT[essentials.ferryClass] ?? 1;
    return ferryLegCount * FERRY_BASE_ECON * mult * Math.max(1, adults);
  }, [ferryLegCount, essentials.ferryClass, adults]);

  const boatTotal = useMemo(
    () => boatLegCount * BOAT_BASE_REMOTE * Math.max(1, adults),
    [boatLegCount, adults]
  );

  const cabDayRate = useMemo(() => {
    const found = CAB_MODELS.find((c) => c.id === essentials.cabModelId);
    return found ? found.dayRate : CAB_MODELS[0].dayRate;
  }, [essentials.cabModelId]);

  const logisticsTotal = useMemo(() => {
    let sum = 0;
    days.forEach((day) => {
      const hasFerry = day.items.some((i) => i.type === "ferry");
      const hasDeparture = day.items.some((i) => i.type === "departure");
      if (hasFerry || hasDeparture) return;

      const stops = day.items.filter((i) => i.type === "location").length;

      if (scooterIslands.has(day.island)) {
        sum += SCOOTER_DAY_RATE;
        return;
      }

      if (bicycleIslands.has(day.island)) {
        sum += BICYCLE_DAY_RATE;
        return;
      }

      if (day.transport === "Day Cab") sum += cabDayRate;
      else if (day.transport === "Scooter") sum += SCOOTER_DAY_RATE;
      else sum += Math.max(1, stops - 1) * P2P_RATE_PER_HOP;
    });
    return sum;
  }, [days, scooterIslands, bicycleIslands, cabDayRate]);

  const grandTotal = hotelsTotal + addonsTotal + logisticsTotal + ferryTotal + boatTotal;
  const pax = adults + infants;

  const toggleScooter = (island, enableExplicit) => {
    setScooterIslands((prev) => {
      const next = new Set(prev);
      if (typeof enableExplicit === "boolean") {
        if (enableExplicit) next.add(island);
        else next.delete(island);
      } else {
        if (next.has(island)) next.delete(island);
        else next.add(island);
      }
      return next;
    });
  };

  const toggleBicycle = (island) => {
    setBicycleIslands((prev) => {
      const next = new Set(prev);
      if (next.has(island)) next.delete(island);
      else next.add(island);
      return next;
    });
  };

  if (dataStatus === "loading") {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
        Loading Andaman data…
      </div>
    );
  }
  if (dataStatus === "error") {
    return (
      <div
        style={{
          padding: 24,
          fontFamily: "system-ui, Arial",
          color: "#b91c1c",
        }}
      >
        Could not load data. Please check <code>/public/data/*.json</code> in
        the repo.
      </div>
    );
  }

  const openModalFor = (loc) => {
    const nearby = locations
      .filter((l) => l.island === loc.island && l.id !== loc.id)
      .slice(0, 6)
      .map((l) => ({
        id: l.id,
        name: l.name,
        island: l.island,
      }));

    const advIds = new Set();
    locAdventures.forEach((m) => {
      const locId = m.locationId || m.location_id;
      const advList = m.adventureIds || m.adventure_ids || [];
      if (locId && locId === loc.id) {
        advList.forEach((id) => advIds.add(id));
      }
    });

    const adventures = activities
      .filter((a) => advIds.has(a.id))
      .map((a) => ({
        id: a.id,
        name: a.name,
        type: a.category || a.type || "Adventure",
        basePriceINR: a.basePriceINR ?? a.price,
      }));

    setOpenLoc({
      ...loc,
      nearby,
      adventures,
    });
  };

  const closeModal = () => setOpenLoc(null);

  /* ---------- UI ---------- */

  return (
    <div
      style={{
        fontFamily: "system-ui, Arial",
        background: "#f6f7f8",
        minHeight: "100vh",
        color: "#0f172a",
      }}
    >
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "white",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "12px 16px 8px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {/* left: title */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background:
                  "linear-gradient(90deg, #0891b2, #06b6d4, #22d3ee)",
              }}
            />
            <b>Create Your Andaman Tour</b>
          </div>

          {/* right: step + mini summary */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 6,
              marginLeft: "auto",
            }}
          >
            <span
              style={{
                fontSize: 12,
                display: "inline-flex",
                gap: 6,
                alignItems: "center",
              }}
            >
              <span style={{ color: "#64748b" }}>Step</span>
              <span
                style={{
                  fontWeight: 800,
                  background: "white",
                  border: "1px solid #e5e7eb",
                  padding: "2px 8px",
                  borderRadius: 999,
                }}
              >
                {step + 1} / 6
              </span>
            </span>

            {/* TOP SUMMARY BAR (replaces the mobile bottom bar) */}
            <div
              style={{
                display: "inline-flex",
                flexWrap: "wrap",
                gap: 8,
                padding: "4px 10px",
                borderRadius: 999,
                background:
                  "linear-gradient(90deg,#0891b2,#06b6d4,#22d3ee)",
                color: "white",
                fontSize: 11,
                boxShadow: "0 4px 12px rgba(8,145,178,0.35)",
              }}
            >
              <span style={{ fontWeight: 700 }}>
                Total: {formatINR(grandTotal)}
              </span>
              <span>• {days.length} day(s)</span>
              <span>• {pax} traveller(s)</span>
            </div>
          </div>
        </div>

        <Stepper step={step} setStep={setStep} />
      </header>

      {/* Body */}
      <main className="app-main">
        <section>
          {/* STEP 0: basics */}
          {/* ... KEEP YOUR EXISTING STEP CONTENT HERE ... */}
        </section>

        {/* Desktop summary */}
        <aside className="sidebar">
          {/* keep your existing desktop summary card here */}
        </aside>
      </main>

      {/* Location detail modal */}
      <LocationModal
        location={openLoc}
        onClose={closeModal}
        onAddLocation={() => {
          console.log("Add location to trip:", openLoc?.id);
        }}
        onAddAdventure={() => {
          console.log("Add adventures for location:", openLoc?.id);
        }}
      />
    </div>
  );
}

/* ----- Tiny helpers & presentational components ---- */
// Reuse your existing miniBtn, pillBtn, dangerBtn, RowSplit, Card, Row, Field, FooterNav, Stepper, Chip, AdventureCard
