import React, { JSX, useState } from "react";
import { createTour } from "../../services/apiClient";
import { useNavigate } from "react-router-dom";

const LINE_OPTIONS = [
  { value: "RED", label: "Red Line" },
  { value: "ROUTE_A", label: "Route A Preferred" },
];
const COUNTRY_OPTIONS = [
  "France", "Switzerland", "Italy", "Vatican City", "Austria", "Germany", "Spain", "Portugal", "Philippines", "USA", "Canada"
];

interface NewTourPayload {
  title: string;
  slug: string;
  summary: string;
  line: string;
  durationDays: number;
  highlights: string[];
  images: string[];
  guaranteedDeparture: boolean;
  bookingPdfUrl: string;
  travelWindow?: { start: string; end: string };
  itinerary?: { day: number; title: string; description: string }[];
  fullStops?: { city: string; country: string; days?: number }[];
  regularPricePerPerson: number;
  promoPricePerPerson?: number;
  basePricePerDay?: number;
  additionalInfo?: {
    countriesVisited: string[];
    startingPoint: string;
    endingPoint: string;
    mainCities: { [country: string]: string[] };
  };
}

export default function CreateTour(): JSX.Element {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [line, setLine] = useState(LINE_OPTIONS[0].value);
  const [durationDays, setDurationDays] = useState(7);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [highlightInput, setHighlightInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [guaranteedDeparture, setGuaranteedDeparture] = useState(false);
  const [bookingPdfUrl, setBookingPdfUrl] = useState("");
  const [travelStart, setTravelStart] = useState("");
  const [travelEnd, setTravelEnd] = useState("");
  const [itinerary, setItinerary] = useState<{ day: number; title: string; description: string }[]>([]);
  const [countriesVisited, setCountriesVisited] = useState<string[]>([]);
  const [startingPoint, setStartingPoint] = useState("");
  const [endingPoint, setEndingPoint] = useState("");
  const [mainCities, setMainCities] = useState<{ [country: string]: string }>({});
  const [fullStops, setFullStops] = useState<{ city: string; country: string; days?: number }[]>([]);
  const [regularPrice, setRegularPrice] = useState<number | "">("");
  const [promoPrice, setPromoPrice] = useState<number | "">("");
  const [basePricePerDay, setBasePricePerDay] = useState<number | "">("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Highlight helpers
  function addHighlight(e: React.KeyboardEvent | React.MouseEvent) {
    e.preventDefault();
    const val = highlightInput.trim();
    if (val && !highlights.includes(val)) setHighlights([...highlights, val]);
    setHighlightInput("");
  }
  function removeHighlight(h: string) {
    setHighlights(highlights.filter(x => x !== h));
  }

  // Image helpers
  function addImage(e: React.KeyboardEvent | React.MouseEvent) {
    e.preventDefault();
    const val = imageInput.trim();
    if (val && !images.includes(val)) setImages([...images, val]);
    setImageInput("");
  }
  function removeImage(img: string) {
    setImages(images.filter(x => x !== img));
  }

  // Itinerary helpers
  function addItineraryDay() {
    setItinerary(itinerary.concat({ day: itinerary.length + 1, title: "", description: "" }));
  }
  function updateItinerary(idx: number, field: "title" | "description", value: string) {
    setItinerary(itinerary.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  }
  function removeItinerary(idx: number) {
    setItinerary(itinerary.filter((_, i) => i !== idx).map((it, i) => ({ ...it, day: i + 1 })));
  }

  // Full stop helpers
  function addFullStop() {
    setFullStops(fullStops.concat({ city: "", country: "" }));
  }

  function updateFullStop(idx: number, field: "city" | "country" | "days", value: string) {
    setFullStops(fullStops.map((fs, i) => {
      if (i !== idx) return fs;
      if (field === "days") {
        return { ...fs, days: value === "" ? undefined : Number(value) };
      }
      return { ...fs, [field]: value };
    }));
  }

  function removeFullStop(idx: number) {
    setFullStops(fullStops.filter((_, i) => i !== idx));
  }

  function handleCountriesChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = Array.from(e.target.selectedOptions).map(o => o.value);
    setCountriesVisited(selected);
    setMainCities(prev => {
      const next = { ...prev };
      // ensure selected countries exist as keys
      selected.forEach(c => {
        if (!(c in next)) next[c] = "";
      });
      // remove keys for unselected countries
      Object.keys(next).forEach(k => {
        if (!selected.includes(k)) delete next[k];
      });
      return next;
    });
  }

  function updateMainCities(country: string, value: string) {
    setMainCities(prev => ({ ...prev, [country]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: NewTourPayload = {
        title,
        slug,
        summary,
        line,
        durationDays: Number(durationDays),
        highlights,
        images,
        guaranteedDeparture,
        bookingPdfUrl,
        travelWindow: travelStart && travelEnd ? { start: travelStart, end: travelEnd } : undefined,
        itinerary: itinerary.length ? itinerary : undefined,
        fullStops: fullStops.length
          ? fullStops.map(fs => ({ ...fs, days: fs.days !== undefined ? Number(fs.days) : undefined }))
          : undefined,
        regularPricePerPerson: Number(regularPrice || 0),
        promoPricePerPerson: promoPrice ? Number(promoPrice) : undefined,
        basePricePerDay: basePricePerDay ? Number(basePricePerDay) : undefined,
        additionalInfo: {
          countriesVisited,
          startingPoint,
          endingPoint,
          mainCities: Object.fromEntries(
            Object.entries(mainCities)
              .filter(([country, cities]) => country && cities)
              .map(([country, cities]) => [country, cities.split(",").map(s => s.trim()).filter(Boolean)])
          ),
        },
      };
      await createTour(payload);
      setSuccess(true);
      setTimeout(() => navigate("/tours"), 1000);
    } catch (err) {
      console.error(err);
      setError("Failed to create tour");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{
      maxWidth: 720,
      margin: "32px auto",
      background: "#fff",
      borderRadius: 12,
      boxShadow: "0 2px 16px 0 rgba(30,30,60,.07)",
      padding: 32
    }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Create a new tour</h2>
      <div style={{ color: "#666", marginBottom: 24, fontSize: 15 }}>
        Fill out the fields below to add a new tour.
      </div>

      {error && <div style={{ background: "#ffe0e0", color: "#b00", padding: "10px 14px", borderRadius: 6, marginBottom: 14 }}>{error}</div>}
      {success && <div style={{ background: "#e6ffe4", color: "#208030", padding: "10px 14px", borderRadius: 6, marginBottom: 14 }}>Tour created!</div>}

      <form onSubmit={handleSave} autoComplete="off">
        {/* Basic fields */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Title
            <input value={title} onChange={e => setTitle(e.target.value)} required style={inputStyle} autoFocus />
          </label>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Slug
            <input value={slug} onChange={e => setSlug(e.target.value)} required style={inputStyle} />
          </label>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Summary
            <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={2} style={{ ...inputStyle, minHeight: 36 }} />
          </label>
        </div>
        <div style={{ marginBottom: 16, display: "flex", gap: 10 }}>
          <label style={{ ...labelStyle, flex: 1 }}>Line
            <select value={line} onChange={e => setLine(e.target.value)} style={inputStyle}>
              {LINE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </label>
          <label style={{ ...labelStyle, flex: 1 }}>Duration (days)
            <input type="number" value={durationDays} min={1} max={60} onChange={e => setDurationDays(Number(e.target.value))} style={inputStyle} />
          </label>
        </div>

        {/* Highlights & images */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Highlights
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <input
                value={highlightInput}
                onChange={e => setHighlightInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" ? addHighlight(e) : undefined}
                placeholder="Add highlight and press Enter"
                style={{ ...inputStyle, flex: 1 }}
              />
              <button type="button" style={buttonStyle} onClick={addHighlight} disabled={!highlightInput.trim()}>Add</button>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
              {highlights.map(h => (
                <span key={h} style={{
                  background: "#f2e5ed", color: "#ae3c74", borderRadius: 6,
                  padding: "5px 10px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4
                }}>{h}
                  <button type="button" aria-label="Remove" style={{ marginLeft: 2, border: "none", background: "none", color: "#ae3c74", cursor: "pointer" }} onClick={() => removeHighlight(h)}>&times;</button>
                </span>
              ))}
            </div>
          </label>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Images (URLs)
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <input
                value={imageInput}
                onChange={e => setImageInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" ? addImage(e) : undefined}
                placeholder="Add image URL and press Enter"
                style={{ ...inputStyle, flex: 1 }}
              />
              <button type="button" style={buttonStyle} onClick={addImage} disabled={!imageInput.trim()}>Add</button>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
              {images.map(img => (
                <span key={img} style={{
                  background: "#e6f7fa", color: "#268fae", borderRadius: 6,
                  padding: "5px 10px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4
                }}>{img}
                  <button type="button" aria-label="Remove" style={{ marginLeft: 2, border: "none", background: "none", color: "#268fae", cursor: "pointer" }} onClick={() => removeImage(img)}>&times;</button>
                </span>
              ))}
            </div>
          </label>
        </div>

        {/* Prices and booking info */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <label style={{ ...labelStyle, flex: 1 }}>Regular price (₱)
            <input type="number" min={0} value={regularPrice} onChange={e => setRegularPrice(e.target.value ? Number(e.target.value) : "")} style={inputStyle} />
          </label>
          <label style={{ ...labelStyle, flex: 1 }}>Promo price (₱)
            <input type="number" min={0} value={promoPrice} onChange={e => setPromoPrice(e.target.value ? Number(e.target.value) : "")} style={inputStyle} />
          </label>
          <label style={{ ...labelStyle, flex: 1 }}>Base price per day (₱)
            <input type="number" min={0} value={basePricePerDay} onChange={e => setBasePricePerDay(e.target.value ? Number(e.target.value) : "")} style={inputStyle} />
          </label>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Booking PDF URL
            <input value={bookingPdfUrl} onChange={e => setBookingPdfUrl(e.target.value)} placeholder="/assets/route-a-preferred.pdf" style={inputStyle} />
          </label>
        </div>
        <div style={{ marginBottom: 16, display: "flex", gap: 10 }}>
          <label style={{ ...labelStyle, flex: 1 }}>Travel Start
            <input type="date" value={travelStart} onChange={e => setTravelStart(e.target.value)} style={inputStyle} />
          </label>
          <label style={{ ...labelStyle, flex: 1 }}>Travel End
            <input type="date" value={travelEnd} onChange={e => setTravelEnd(e.target.value)} style={inputStyle} />
          </label>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>
            <input type="checkbox" checked={guaranteedDeparture} onChange={e => setGuaranteedDeparture(e.target.checked)} style={{ marginRight: 8 }} />
            Guaranteed departure
          </label>
        </div>

        {/* Itinerary */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Itinerary
            <button type="button" style={{ ...buttonStyle, marginLeft: 12, background: "#eee", color: "#111" }} onClick={addItineraryDay}>+ Day</button>
          </label>
          <div>
            {itinerary.map((it, idx) => (
              <div key={idx} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
                <span style={{ minWidth: 28, color: "#888" }}>Day {it.day}</span>
                <input
                  value={it.title}
                  onChange={e => updateItinerary(idx, "title", e.target.value)}
                  placeholder="Title"
                  style={{ ...inputStyle, flex: 2 }}
                  required
                />
                <input
                  value={it.description}
                  onChange={e => updateItinerary(idx, "description", e.target.value)}
                  placeholder="Description"
                  style={{ ...inputStyle, flex: 3 }}
                  required
                />
                <button type="button" style={{ ...buttonStyle, background: "#eee", color: "#b00" }} onClick={() => removeItinerary(idx)}>&times;</button>
              </div>
            ))}
          </div>
        </div>

        {/* Full Stops */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Full Stops
            <button type="button" style={{ ...buttonStyle, marginLeft: 12, background: "#eee", color: "#111" }} onClick={addFullStop}>+ Stop</button>
          </label>
          <div>
            {fullStops.map((fs, idx) => (
              <div key={idx} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
                <input
                  value={fs.city}
                  onChange={e => updateFullStop(idx, "city", e.target.value)}
                  placeholder="City"
                  style={{ ...inputStyle, flex: 2 }}
                  required
                />
                <select
                  value={fs.country}
                  onChange={e => updateFullStop(idx, "country", e.target.value)}
                  style={{ ...inputStyle, flex: 2 }}
                  required
                >
                  <option value="">Country</option>
                  {COUNTRY_OPTIONS.map(c => (
                    <option value={c} key={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={fs.days ?? ""}
                  min={1}
                  onChange={e => updateFullStop(idx, "days", e.target.value)}
                  placeholder="Days"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button type="button" style={{ ...buttonStyle, background: "#eee", color: "#b00" }} onClick={() => removeFullStop(idx)}>&times;</button>
              </div>
            ))}
          </div>
        </div>

        {/* Countries, start/end, main cities */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Countries visited
            <select multiple value={countriesVisited} onChange={handleCountriesChange} style={{ ...inputStyle, minHeight: 80 }}>
              {COUNTRY_OPTIONS.map(c => (
                <option value={c} key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <label style={{ ...labelStyle, flex: 1 }}>Starting point
            <input value={startingPoint} onChange={e => setStartingPoint(e.target.value)} style={inputStyle} />
          </label>
          <label style={{ ...labelStyle, flex: 1 }}>Ending point
            <input value={endingPoint} onChange={e => setEndingPoint(e.target.value)} style={inputStyle} />
          </label>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Main cities (country: cities, comma separated)
            {countriesVisited.map(country => (
              <div key={country} style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                <span style={{ minWidth: 80, fontSize: 13 }}>{country}</span>
                <input
                  value={mainCities[country] ?? ""}
                  onChange={e => updateMainCities(country, e.target.value)}
                  placeholder="e.g. Paris, Nice"
                  style={inputStyle}
                />
              </div>
            ))}
          </label>
          <div style={helperStyle}>Used for grouping cities by country in tour info.</div>
        </div>

        <button
          type="submit"
          disabled={saving || !title || !slug}
          style={{
            background: saving ? "#ccc" : "linear-gradient(90deg,#ee4d7e 0,#ff6a3d 100%)",
            color: "#fff",
            fontWeight: 700,
            padding: "12px 30px",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            cursor: saving ? "not-allowed" : "pointer",
            boxShadow: "0 1.5px 8px 0 rgba(230,50,50,.08)",
            transition: ".2s"
          }}
        >
          {saving ? "Saving…" : "Create tour"}
        </button>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 6,
  border: "1px solid #ddd",
  fontSize: 15,
  marginTop: 6,
  boxSizing: "border-box",
  outline: "none",
};
const labelStyle: React.CSSProperties = { fontWeight: 600, display: "block", marginBottom: 7 };
const buttonStyle: React.CSSProperties = {
  padding: "9px 18px",
  borderRadius: 6,
  border: "none",
  fontWeight: 600,
  cursor: "pointer",
  background: "linear-gradient(90deg,#ee4d7e 0,#ff6a3d 100%)",
  color: "#fff"
};
const helperStyle: React.CSSProperties = {
  color: "#888",
  fontSize: 13,
  marginTop: 4,
};