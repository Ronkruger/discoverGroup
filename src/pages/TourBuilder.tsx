/**
 * TourForm Fields Reference (Admin Form)
 *
 * This list reflects all fields used in the admin TourForm for tour creation/editing.
 * Keep this in sync with the form and backend payloads for maintainability.
 *
 * Fields:
 * - title
 * - slug
 * - summary
 * - shortDescription
 * - line
 * - durationDays
 * - images
 * - galleryImages
 * - highlights
 * - itinerary
 * - departureDates
 * - travelWindow (start, end)
 * - basePricePerDay
 * - regularPricePerPerson
 * - promoPricePerPerson
 * - guaranteedDeparture
 * - bookingPdfUrl
 * - additionalInfo (countries, countriesVisited, ...)
 * - fullStops
 * - extensions
 */
// Helper to validate image URLs against CSP
function isSafeImageUrl(url: string | undefined): boolean {
  if (!url) return false;
  // Allow only http(s) URLs or relative URLs
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("/")
  );
}
import { useNavigate, useParams, Link } from "react-router-dom";
import { useEffect, useRef, useState, type JSX, type ChangeEvent } from "react";
import type { Tour, Stop, ItineraryDay } from "../types";
import { fetchTourBySlug, fetchTours } from "../api/tours";
import React from "react";
import BackToTop from "../components/BackToTop";

export default function TourBuilder(): JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [tour, setTour] = useState<Tour | null | undefined>(undefined);
  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [joinIndex, setJoinIndex] = useState<number | null>(null);
  const [leaveIndex, setLeaveIndex] = useState<number | null>(null);
  const [passengers, setPassengers] = useState<number>(1);
  const [includeInfant, setIncludeInfant] = useState<boolean>(false);
  const [infantCount, setInfantCount] = useState<number>(1);

  const [expandedChangeAt, setExpandedChangeAt] = useState<number | null>(null);
  const [inlineInsert, setInlineInsert] = useState<{ tour: Tour; insertAfterIndex: number } | null>(null);

  // New: selected country filter
  const [countryFilter, setCountryFilter] = useState<string | null>(null);

  const pageTopRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const [verticalBars, setVerticalBars] = useState<{ top: number; height: number; color: string; x: number }[]>([]);
  const [connectors, setConnectors] = useState<{ left: number; top: number; width: number; gradient: string }[]>([]);

  const lineColorClassMap: Record<string, string> = {
    RED: "bg-red-500",
    BLUE: "bg-blue-500",
    GREEN: "bg-green-500",
    YELLOW: "bg-yellow-500",
    BROWN: "bg-yellow-900",
    ROUTE_A: "bg-rose-600",
    DEFAULT: "bg-gray-400",
  };

  const lineHexMap: Record<string, string> = {
    RED: "#ef4444",
    BLUE: "#3b82f6",
    GREEN: "#10b981",
    YELLOW: "#f59e0b",
    BROWN: "#b45309",
    ROUTE_A: "#94a3b8",
    DEFAULT: "#94a3b8",
  };

  useEffect(() => {
    fetchTours().then(setAllTours).catch((err) => console.error("fetchTours error:", err));
  }, []);

  useEffect(() => {
    if (!slug) {
      // No slug = empty builder (no default tour)
      setTour(null);
      setSelectedDate(null);
      setJoinIndex(null);
      setLeaveIndex(null);
      setExpandedChangeAt(null);
      setInlineInsert(null);
      setPassengers(1);
      setIncludeInfant(false);
      setInfantCount(1);
      setCountryFilter(null);
      return;
    }
    setTour(undefined);
    fetchTourBySlug(slug)
      .then((t) => {
        setTour(t);
        setSelectedDate(t?.travelWindow?.start ?? null);
        setJoinIndex(null);
        setLeaveIndex(null);
        setExpandedChangeAt(null);
        setInlineInsert(null);
        setPassengers(1);
        setIncludeInfant(false);
        setInfantCount(1);
        setCountryFilter(null); // clear filter when route changes
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 60);
      })
      .catch((err) => {
        console.error("fetchTourBySlug error:", err);
        setTour(null);
      });
  }, [slug]);

  // map days -> stops using Stop.days (fallback 1)
  function mapDaysToStops(t: Tour | null | undefined): (Stop | undefined)[] {
    if (!t) return [];
    const length = t.itinerary?.length ?? t.durationDays ?? 0;
    const dayStops: (Stop | undefined)[] = Array(length).fill(undefined);
    const full = t.fullStops ?? [];

    let cursor = 0;
    for (const s of full) {
      const daysHere = typeof s.days === "number" && s.days > 0 ? s.days : 1;
      for (let i = 0; i < daysHere && cursor < length; i += 1, cursor += 1) {
        dayStops[cursor] = s;
      }
    }

    if (cursor < length) {
      const last = dayStops[Math.max(0, cursor - 1)] ?? full[full.length - 1];
      for (let i = cursor; i < length; i += 1) dayStops[i] = last;
    }

    const first = full[0];
    if (first) {
      for (let i = 0; i < length; i += 1) if (!dayStops[i]) dayStops[i] = first;
    }

    return dayStops;
  }

  function buildStopRangesForTour(t: Tour | null | undefined, offset = 0) {
    if (!t) return [] as { stop: Stop; start: number; end: number }[];
    const length = t.itinerary?.length ?? t.durationDays ?? 0;
    const full = t.fullStops ?? [];
    const ranges: { stop: Stop; start: number; end: number }[] = [];

    let cursor = 0;
    for (const s of full) {
      const daysHere = typeof s.days === "number" && s.days > 0 ? s.days : 1;
      const start = offset + cursor;
      const end = Math.min(offset + cursor + daysHere - 1, offset + length - 1);
      ranges.push({ stop: s, start, end });
      cursor += daysHere;
    }

    if (cursor < length && ranges.length > 0) {
      ranges[ranges.length - 1].end = offset + length - 1;
    }
    if (ranges.length === 0 && full.length > 0) {
      ranges.push({ stop: full[0], start: offset, end: offset + Math.max(0, length - 1) });
    }
    return ranges;
  }

  const dayStops = mapDaysToStops(tour);
  const itinerary = tour?.itinerary ?? [];
  const baseRanges = buildStopRangesForTour(tour, 0);
  const insertRangesUnshifted = inlineInsert ? buildStopRangesForTour(inlineInsert.tour, inlineInsert.insertAfterIndex + 1) : [];

  // Build merged preview ranges (move trailing base ranges after inserted route)
  function buildMergedRanges() {
    if (!inlineInsert || !tour) return { mergedRanges: baseRanges.slice(), mergedLength: itinerary.length };

    const insertLen = inlineInsert.tour.itinerary?.length ?? inlineInsert.tour.durationDays ?? 0;
    const insertAfter = inlineInsert.insertAfterIndex;

    const before: { stop: Stop; start: number; end: number }[] = [];
    const after: { stop: Stop; start: number; end: number }[] = [];

    for (let i = 0; i < baseRanges.length; i += 1) {
      const r = baseRanges[i];
      const isLastBaseRange = i === baseRanges.length - 1;

      if (r.end < insertAfter) {
        before.push({ ...r });
        continue;
      }

      if (r.start > insertAfter) {
        after.push({ stop: r.stop, start: r.start + insertLen, end: r.end + insertLen });
        continue;
      }

      // overlap
      if (isLastBaseRange && r.start <= insertAfter) {
        after.push({ stop: r.stop, start: r.start + insertLen, end: r.end + insertLen });
        continue;
      }

      // split into before and after
      if (r.start <= insertAfter && r.end >= insertAfter) {
        before.push({ stop: r.stop, start: r.start, end: insertAfter });
        const afterStart = insertAfter + 1 + insertLen;
        const afterEnd = r.end + insertLen;
        after.push({ stop: r.stop, start: afterStart, end: afterEnd });
      }
    }

    const mergedRanges = [...before, ...insertRangesUnshifted, ...after];
    const mergedLength = itinerary.length + insertLen;
    return { mergedRanges, mergedLength };
  }

  const { mergedRanges, mergedLength } = buildMergedRanges();

  // Build merged day stops
  function buildMergedDayStops() {
    const length = mergedLength ?? itinerary.length;
    const dStops: (Stop | undefined)[] = Array(length).fill(undefined);

    if (mergedRanges && mergedRanges.length) {
      for (const r of mergedRanges) {
        for (let d = r.start; d <= r.end && d < length; d += 1) {
          dStops[d] = r.stop;
        }
      }
    }

    const first = dStops.find((s) => !!s);
    for (let i = 0; i < length; i += 1) {
      if (!dStops[i]) dStops[i] = i > 0 ? dStops[i - 1] ?? first : first;
    }
    return dStops;
  }
  const mergedDayStops = buildMergedDayStops();

  function buildMergedPlacesPerDay() {
    const length = mergedLength ?? itinerary.length;
    const result: { city: string; colorHex: string; source: "base" | "insert" }[][] = Array.from({ length }, () => []);
    if (!mergedRanges || mergedRanges.length === 0) return result;

    for (let d = 0; d < length; d += 1) {
      for (const r of mergedRanges) {
        if (r.start <= d && d <= r.end) {
          const city = r.stop?.city;
          if (!city) continue;
          const isInsertRange = inlineInsert
            ? insertRangesUnshifted.some((ir) => ir.stop === r.stop && ir.start === r.start && ir.end === r.end)
            : false;
          const source: "base" | "insert" = isInsertRange ? "insert" : "base";
          const colorHex = source === "insert"
            ? (lineHexMap[inlineInsert!.tour.line ?? "DEFAULT"] ?? lineHexMap.DEFAULT)
            : (lineHexMap[tour!.line ?? "DEFAULT"] ?? lineHexMap.DEFAULT);
          if (!result[d].some((it) => it.city === city && it.source === source)) {
            result[d].push({ city, colorHex, source });
          }
        }
      }
    }
    return result;
  }

  const mergedPlacesPerDay = buildMergedPlacesPerDay();
  const finalLength = mergedLength ?? itinerary.length;
  const finalDayStops = mergedDayStops.length ? mergedDayStops : dayStops;
  const finalPlacesPerDay = mergedPlacesPerDay.length ? mergedPlacesPerDay : (() => {
    const length = itinerary.length;
    const arr: { city: string; colorHex: string; source: "base" | "insert" }[][] = Array.from({ length }, () => []);
    if (tour) {
      const baseColor = lineHexMap[tour.line ?? "DEFAULT"] ?? lineHexMap.DEFAULT;
      for (let d = 0; d < length; d += 1) {
        for (const r of baseRanges) {
          if (r.start <= d && d <= r.end) {
            const city = r.stop?.city;
            if (city && !arr[d].some((it) => it.city === city && it.source === "base")) {
              arr[d].push({ city, colorHex: baseColor, source: "base" });
            }
          }
        }
      }
    }
    return arr;
  })();

  // compute vertical bars and horizontal connectors (measurement-driven)
  useEffect(() => {
    if (!timelineRef.current) return;
    const containerRect = timelineRef.current.getBoundingClientRect();

    const dayColor: (string | null)[] = Array(finalLength).fill(null);
    for (const r of mergedRanges) {
      const isInsertRange = inlineInsert
        ? insertRangesUnshifted.some((ir) => ir.stop === r.stop && ir.start === r.start && ir.end === r.end)
        : false;
      const color = isInsertRange ? (lineHexMap[inlineInsert!.tour.line ?? "DEFAULT"] ?? lineHexMap.DEFAULT) : (lineHexMap[tour!.line ?? "DEFAULT"] ?? lineHexMap.DEFAULT);
      for (let d = r.start; d <= r.end && d < finalLength; d += 1) dayColor[d] = color;
    }

    // contiguous spans grouping
    const spans: { start: number; end: number; color: string }[] = [];
    let cursor = 0;
    while (cursor < finalLength) {
      const c = dayColor[cursor];
      if (!c) { cursor += 1; continue; }
      let end = cursor;
      while (end + 1 < finalLength && dayColor[end + 1] === c) end += 1;
      spans.push({ start: cursor, end, color: c });
      cursor = end + 1;
    }

    // measure rail center and compute left/right bar positions
    const railRect = railRef.current?.getBoundingClientRect();
    const railCenterX = railRect ? (railRect.left + railRect.width / 2) : (containerRect.left + 28);
    const railCenterRelative = railCenterX - containerRect.left;

    const BAR_W = 12;
    const LEFT_BAR_X = Math.max(railCenterRelative - BAR_W / 2, 6);
    const RIGHT_BAR_MARGIN = 44;
    const RIGHT_BAR_CENTER = Math.max(containerRect.width - RIGHT_BAR_MARGIN, railCenterRelative + 80);
    const RIGHT_BAR_X = RIGHT_BAR_CENTER - BAR_W / 2;

    const bars: { top: number; height: number; color: string; x: number }[] = [];
    for (let i = 0; i < spans.length; i += 1) {
      const s = spans[i];
      const startNode = rowRefs.current[s.start];
      const endNode = rowRefs.current[s.end];
      if (!startNode || !endNode) continue;
      const startRect = startNode.getBoundingClientRect();
      const endRect = endNode.getBoundingClientRect();
      const top = Math.round(startRect.top - containerRect.top);
      const bottom = Math.round(endRect.bottom - containerRect.top);
      const height = Math.max(12, bottom - top);
      const side = i % 2 === 0 ? "right" : "left";
      const x = side === "right" ? RIGHT_BAR_X : LEFT_BAR_X;
      bars.push({ top, height, color: s.color, x });
    }
    setVerticalBars(bars);

    const conns: { left: number; top: number; width: number; gradient: string }[] = [];
    for (let i = 0; i < spans.length - 1; i += 1) {
      const a = spans[i];
      const b = spans[i + 1];
      if (a.end + 1 !== b.start) continue;
      if (a.color === b.color) continue;
      const sideA = i % 2 === 0 ? "right" : "left";
      const sideB = (i + 1) % 2 === 0 ? "right" : "left";
      if (sideA === sideB) continue;

      const barA = bars[i];
      const barB = bars[i + 1];
      if (!barA || !barB) continue;

      const centerAX = barA.x + BAR_W / 2;
      const centerBX = barB.x + BAR_W / 2;
      const left = Math.min(centerAX, centerBX);
      const width = Math.max(8, Math.abs(centerBX - centerAX));
      const boundaryRow = rowRefs.current[b.start];
      if (!boundaryRow) continue;
      const rowRect = boundaryRow.getBoundingClientRect();
      const top = Math.round(rowRect.top - containerRect.top + rowRect.height / 2 - 3);
      const gradient = `linear-gradient(90deg, ${a.color}33 0%, ${b.color}33 100%)`;
      conns.push({ left, top, width, gradient });
    }
    setConnectors(conns);

    const onResize = () => { setTimeout(() => { setVerticalBars((p) => [...p]); setConnectors((p) => [...p]); }, 60); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergedRanges, inlineInsert, finalLength, tour]);

  // ---- small helpers ----
  function formatDateISO(dateISO: string | Date | null | undefined) {
    if (!dateISO) return "—";
    const d = typeof dateISO === "string" ? new Date(dateISO) : dateISO;
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
  }
  function formatWeekday(dateISO: string | Date | null | undefined) {
    if (!dateISO) return "—";
    const d = typeof dateISO === "string" ? new Date(dateISO) : dateISO;
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase();
  }
  function formatMonthDay(dateISO: string | Date | null | undefined) {
    if (!dateISO) return "—";
    const d = typeof dateISO === "string" ? new Date(dateISO) : dateISO;
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short" }).toUpperCase();
  }
  function dateForDayIndex(dayIndex: number): string {
    if (!selectedDate) return "";
    const base = new Date(selectedDate);
    const ms = base.getTime() + dayIndex * 24 * 60 * 60 * 1000;
    return new Date(ms).toISOString();
  }

  // computeDays: use explicit selection if present; otherwise reflect merged preview when inlineInsert exists
  function computeDays(): number {
    if (joinIndex !== null && leaveIndex !== null && leaveIndex >= joinIndex) return leaveIndex - joinIndex + 1;
    if (inlineInsert && typeof mergedLength === "number") return mergedLength;
    return tour?.durationDays ?? itinerary.length ?? 0;
  }

  // Pricing helpers:
  interface TourWithPrices extends Tour {
    regularPricePerPerson?: number;
    promoPricePerPerson?: number;
    basePricePerDay?: number;
  }

  function getPerPersonForTour(t: Tour | null | undefined): number {
    if (!t) return 0;
    const tourWithPrices = t as TourWithPrices;
    if (typeof tourWithPrices.regularPricePerPerson === "number") return tourWithPrices.regularPricePerPerson;
    if (typeof tourWithPrices.promoPricePerPerson === "number") return tourWithPrices.promoPricePerPerson;
    if (typeof tourWithPrices.basePricePerDay === "number") {
      const days = t.durationDays ?? (t.itinerary?.length ?? 0);
      return tourWithPrices.basePricePerDay * days;
    }
    return 0;
  }

  function getCombinedPerPersonPrice(): { base: number; insert: number; totalPerPerson: number } {
    const base = getPerPersonForTour(tour);
    const insert = inlineInsert ? getPerPersonForTour(inlineInsert.tour) : 0;
    const totalPerPerson = base + insert;
    return { base, insert, totalPerPerson };
  }

  function computePrice(): number {
    const combined = getCombinedPerPersonPrice();
    // infants excluded from numeric total (TBD); adult total is per-head * passengers
    return combined.totalPerPerson * Math.max(1, passengers ?? 1);
  }

  function formatCurrency(amount: number, hideCents = false) {
    if (hideCents) {
      return `PHP ${Math.round(amount).toLocaleString("en-PH")}`;
    }
    return `PHP ${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function formattedPrice(): string {
    const base = computePrice();
    if (includeInfant && infantCount > 0) {
      return `${formatCurrency(base)} + ${infantCount} infant(s) (TBD)`;
    }
    return formatCurrency(base);
  }

  // Return breakdown; ONLY include totalValue when an inline insert exists to avoid duplicate "Per head" lines
  function formattedPerPersonBreakdown() {
    const { base, insert, totalPerPerson } = getCombinedPerPersonPrice();

    // No inline insert -> single Per head line
    if (!inlineInsert) {
      return {
        lines: [{ label: "Per head", value: formatCurrency(base) }],
        totalLabel: undefined as string | undefined,
        totalValue: undefined as string | undefined,
      };
    }

    // With inline insert -> show breakdown and total per head
    return {
      lines: [
        { label: "Base per head", value: formatCurrency(base) },
        { label: "Inserted per head", value: formatCurrency(insert) },
      ],
      totalLabel: "Per head (total)",
      totalValue: formatCurrency(totalPerPerson),
    };
  }

  function endDateIso(): string | null {
    if (!selectedDate) return null;
    const base = new Date(selectedDate);
    const days = computeDays();
    const ms = base.getTime() + (days - 1) * 24 * 60 * 60 * 1000;
    return new Date(ms).toISOString();
  }

  // passenger + infant helpers
  function changePassengers(delta: number) {
    setPassengers((prev) => {
      const next = Math.max(1, prev + delta);
      return next;
    });
  }
  function onPassengersInput(e: ChangeEvent<HTMLInputElement>) {
    const v = parseInt(e.target.value, 10);
    if (Number.isNaN(v) || v < 1) return;
    setPassengers(v);
  }

  function changeInfants(delta: number) {
    setInfantCount((prev) => {
      const next = Math.max(1, prev + delta);
      return next;
    });
  }
  function onInfantsInput(e: ChangeEvent<HTMLInputElement>) {
    const v = parseInt(e.target.value, 10);
    if (Number.isNaN(v) || v < 1) return;
    setInfantCount(v);
  }

  // interactions
  function onMarkerClick(idx: number) {
    if (joinIndex === null && leaveIndex === null) { setJoinIndex(idx); setLeaveIndex(idx); return; }
    if (joinIndex !== null && leaveIndex === null) { if (idx < joinIndex) setJoinIndex(idx); else setLeaveIndex(idx); return; }
    if (joinIndex !== null && leaveIndex !== null) {
      if (idx < joinIndex) setJoinIndex(idx);
      else if (idx > leaveIndex) setLeaveIndex(idx);
      else setJoinIndex(idx);
    }
  }

  // sidebarFrom and sidebarTo helpers (prefer on-tour stops; fall back to additionalInfo)
  const extractCityFromString = (s?: unknown) => {
    if (!s || typeof s !== "string") return null;
    return s.split(",")[0].trim();
  };

  const sidebarFrom = (() => {
    if (joinIndex !== null && finalDayStops[joinIndex]?.city) return finalDayStops[joinIndex]!.city;
    if (inlineInsert) {
      const c = inlineInsert.tour.fullStops?.[0]?.city ?? extractCityFromString(inlineInsert.tour.additionalInfo?.startingPoint);
      if (c) return c;
    }
    if (baseRanges && baseRanges.length > 0 && baseRanges[0].stop?.city) return baseRanges[0].stop.city;
    const aiStart = extractCityFromString(tour?.additionalInfo?.startingPoint);
    if (aiStart) return aiStart;
    return finalDayStops[0]?.city ?? "—";
  })();

  const sidebarTo = (() => {
    if (leaveIndex !== null && finalDayStops[leaveIndex]?.city) return finalDayStops[leaveIndex]!.city;
    if (inlineInsert) {
      const stops = inlineInsert.tour.fullStops ?? [];
      const last = stops.length ? stops[stops.length - 1]?.city : undefined;
      const c = last ?? extractCityFromString(inlineInsert.tour.additionalInfo?.endingPoint);
      if (c) return c;
    }
    if (baseRanges && baseRanges.length > 0 && baseRanges[baseRanges.length - 1].stop?.city) return baseRanges[baseRanges.length - 1].stop.city;
    const aiEnd = extractCityFromString(tour?.additionalInfo?.endingPoint);
    if (aiEnd) return aiEnd;
    return finalDayStops[Math.max(finalLength - 1, 0)]?.city ?? "—";
  })();

  function openInlineChangeAt(idx: number) {
    setExpandedChangeAt((prev) => (prev === idx ? null : idx));
    if (expandedChangeAt === idx) setInlineInsert(null);
    setTimeout(() => document.getElementById(`tb-row-${idx}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 120);
  }
  function insertRouteInline(selectedSlug: string) {
    const selected = allTours.find((t) => t.slug === selectedSlug);
    if (!selected || expandedChangeAt === null || !tour) return;
    setInlineInsert({ tour: selected, insertAfterIndex: expandedChangeAt });
    setExpandedChangeAt(null);
  }
  function removeInlineInsert() {
    setInlineInsert(null);
  }

  // resetSegment is now used by the reset button so eslint won't complain
  function resetSegment() {
    setJoinIndex(null);
    setLeaveIndex(null);
  }

  if (tour === undefined) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4 max-w-4xl">
          <div className="h-56 rounded-2xl bg-slate-200" />
          <div className="h-6 w-3/4 rounded bg-slate-200" />
          <div className="h-40 rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }
  if (tour === null) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">Route not found</h2>
        <p className="text-slate-600 mb-6">Please choose another route to customize.</p>
        <div className="max-w-md">
          <select aria-label="Choose a route" className="w-full border rounded-xl px-4 py-3 bg-white shadow-sm" onChange={(e) => navigate(`/tour/builder/${e.target.value}`)} defaultValue="">
            <option value="" disabled>Choose a route...</option>
            {allTours.map((t) => <option key={t.slug} value={t.slug}>{t.title}</option>)}
          </select>
        </div>
      </div>
    );
  }

  const perPersonBreakdown = formattedPerPersonBreakdown();

  // canProceed required by CTA block (visible/disabled state)
  const canProceed = Boolean(tour && selectedDate);

  // Theme style from TourDetail: deep-blue gradient with yellow accent
  const themeStyle: React.CSSProperties = {
    background:
      "linear-gradient(180deg, rgba(2,18,51,1) 0%, rgba(8,42,102,1) 35%, rgba(4,18,55,1) 100%)",
    ["--accent-yellow" as string]: "#FFD24D",
    ["--accent-yellow-600" as string]: "#FFC107",
    ["--muted-slate" as string]: "#94a3b8",
  };

  const countriesVisited = tour?.additionalInfo?.countriesVisited ?? [];

  return (
    <div className="min-h-screen py-10" style={themeStyle}>
      <style>{`
        .accent-yellow { color: var(--accent-yellow); }
        .bg-accent-yellow { background-color: var(--accent-yellow); }
        .ring-accent-yellow { box-shadow: 0 0 0 3px rgba(255,210,77,0.12); }
        .tab-underline { transition: transform .25s cubic-bezier(.2,.9,.2,1), opacity .25s; }
        .fade-enter { opacity: 0; transform: translateY(6px); }
        .fade-enter-active { opacity: 1; transform: translateY(0); transition: all .28s ease; }
        .card-glass { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); backdrop-filter: blur(6px); border: 1px solid rgba(255,255,255,0.06); }
        .modal-backdrop { background: rgba(2,6,23,0.6); }

        /* Timeline highlight adjustments */
        .timeline-section { 
          padding: 32px; 
          border-radius: 24px; 
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); 
          backdrop-filter: blur(8px);
        }
        .timeline-rail { background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02)); width: 2px; }
        .timeline-row { 
          transition: all .25s ease; 
          padding: 20px;
          margin-bottom: 24px;
          border-radius: 16px;
          background: rgba(255,255,255,0.01);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .timeline-row:hover { 
          background: rgba(255,255,255,0.03); 
          transform: translateY(-4px); 
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
          border-color: rgba(255,210,77,0.3);
        }
        .timeline-card { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.04); }
        .timeline-marker { width: 44px; height: 44px; border-radius: 9999px; display: grid; place-items: center; }
        .timeline-marker.included { background: linear-gradient(180deg,#2563eb,#1e40af); box-shadow: 0 6px 20px rgba(2,6,23,0.5); color: white; border: 2px solid rgba(255,255,255,0.06); }
        .timeline-marker.default { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.04); }
        .timeline-bar { box-shadow: 0 8px 30px rgba(2,6,23,0.45); border-radius: 8px; opacity: 0.98; }
        .timeline-connector { opacity: 0.95; box-shadow: 0 6px 20px rgba(2,6,23,0.35); border-radius: 8px; }
        .timeline-heading { color: #e6eefc; font-weight: 700; }
        .timeline-sub { color: rgba(230,238,252,0.75); }
        .timeline-small { color: rgba(230,238,252,0.6); }

        /* Increase small font sizes by 5% inside timeline and card areas to improve readability */
        .timeline-section .text-xs,
        .timeline-section .timeline-small,
        .card-glass .text-xs,
        .card-glass .timeline-small {
          font-size: 105% !important;
          line-height: 1.25;
        }

        /* Badge interaction */
        .badge-filter { cursor: pointer; transition: transform .12s; }
        .badge-filter:hover { transform: translateY(-2px); }
        .badge-active { box-shadow: 0 6px 18px rgba(2,6,23,0.5); transform: scale(1.02); }
      `}</style>

      <div ref={pageTopRef} />
      <div className="container mx-auto px-6 lg:px-12 text-slate-200">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-12">
          <div className="space-y-8">
            <section className="relative rounded-3xl card-glass shadow-sm overflow-visible p-6 timeline-section" aria-label="Timeline">

              {/* Fallback message if no stops or itinerary are present */}
              {(finalLength === 0 || finalDayStops.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="text-lg font-semibold text-slate-300 mb-2">No stops or itinerary found for this tour.</div>
                  <div className="text-sm text-slate-400 mb-4">Please check the tour data or select a different route.</div>
                </div>
              ) : (
                <>
                  {/* Visual connection bars and connectors */}
                  <div className="relative">
                    {verticalBars.map((bar, i) => (
                      <div
                        key={i}
                        className="absolute timeline-bar"
                        style={{
                          top: `${bar.top}px`,
                          height: `${bar.height}px`,
                          left: `${bar.x}px`,
                          width: '12px',
                          backgroundColor: bar.color,
                        }}
                      />
                    ))}
                    {connectors.map((conn, i) => (
                      <div
                        key={i}
                        className="absolute timeline-connector"
                        style={{
                          top: `${conn.top}px`,
                          left: `${conn.left}px`,
                          width: `${conn.width}px`,
                          height: '6px',
                          background: conn.gradient,
                        }}
                      />
                    ))}
                  </div>

                  <div className="space-y-6" ref={timelineRef}>
                    {Array.from({ length: finalLength }).map((_, idx) => {
                      // Use date formatting helpers
                      const dayDate = dateForDayIndex(idx);
                      const weekday = formatWeekday(dayDate);
                      const monthDay = formatMonthDay(dayDate);
                      // Use finalPlacesPerDay for debug
                      const places = finalPlacesPerDay[idx]?.map((p) => p.city).join(', ');
                      // Use lineColorClassMap for styling
                      const colorClass = lineColorClassMap[tour?.line ?? 'DEFAULT'] ?? lineColorClassMap.DEFAULT;
                      // Get itinerary day details if available
                      const itineraryDay = tour?.itinerary?.[idx] as (ItineraryDay & { image?: string }) | undefined;
                      
                      return (
                        <div 
                          key={idx} 
                          ref={(el) => { rowRefs.current[idx] = el; }}
                          id={`tb-row-${idx}`}
                          className={`timeline-row ${colorClass} cursor-pointer hover:shadow-lg transition-all duration-200`}
                          onClick={() => onMarkerClick(idx)}
                        >
                          {/* Day Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="bg-accent-yellow text-slate-900 rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm">
                                {idx + 1}
                              </div>
                              <div>
                                <div className="text-lg font-bold text-white">
                                  {itineraryDay?.title || `Day ${idx + 1}`}
                                </div>
                                <div className="text-sm text-slate-400">{weekday}, {monthDay}</div>
                              </div>
                            </div>
                            <div className="text-sm text-slate-300 bg-white/5 px-3 py-1 rounded-full">
                              {places || 'Location'}
                            </div>
                          </div>

                          {/* Day Content Card */}
                          <div className="bg-white/3 rounded-lg overflow-hidden border border-white/10 hover:border-accent-yellow/50 transition-colors">
                            {/* Image Section */}
                            {itineraryDay?.image && (
                              <div className="relative h-48 overflow-hidden">
                                <img 
                                  src={itineraryDay.image} 
                                  alt={itineraryDay.title || `Day ${idx + 1}`}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                              </div>
                            )}

                            {/* Description Section */}
                            <div className="p-4">
                              {itineraryDay?.description && (
                                <p className="text-slate-200 text-sm leading-relaxed">
                                  {itineraryDay.description}
                                </p>
                              )}
                              
                              {/* Actions */}
                              <div className="mt-4 flex items-center gap-2">
                                <button 
                                  type="button" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openInlineChangeAt(idx);
                                  }}
                                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-medium transition-colors"
                                >
                                  Customize Day
                                </button>
                                {places && (
                                  <div className="text-xs text-slate-400">
                                    📍 {places}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Inline Route Selector (if expanded) */}
                          {expandedChangeAt === idx && (
                            <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-accent-yellow/30">
                              <h4 className="text-sm font-semibold text-white mb-3">Insert Alternative Route After Day {idx + 1}</h4>
                              <select
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                                onChange={(e) => {
                                  if (e.target.value) {
                                    insertRouteInline(e.target.value);
                                  }
                                }}
                                defaultValue=""
                              >
                                <option value="">Select a route...</option>
                                {allTours.filter(t => t.slug !== tour?.slug).map(t => (
                                  <option key={t.slug} value={t.slug}>{t.title}</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => setExpandedChangeAt(null)}
                                className="mt-2 text-xs text-slate-400 hover:text-white"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Inserted Route Indicator */}
                  {inlineInsert && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-white">Additional Route Inserted</div>
                          <div className="text-xs text-slate-300 mt-1">{inlineInsert.tour.title}</div>
                        </div>
                        <button
                          type="button"
                          onClick={removeInlineInsert}
                          className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded text-xs font-medium transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Reset segment control (visible when a segment is selected) */}
              {(joinIndex !== null || leaveIndex !== null) && (
                <div className="flex justify-center mt-6">
                  <button onClick={resetSegment} className="w-12 h-12 rounded-full bg-amber-600 text-slate-900 grid place-items-center shadow-lg hover:scale-105 transition-transform" title="Reset segment" type="button">✕</button>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl card-glass shadow-lg overflow-hidden">
              <img
                src={isSafeImageUrl(tour.images?.[0]) ? tour.images?.[0] : "/assets/placeholder.jpg"}
                alt={tour.title}
                className="w-full h-36 object-cover"
              />
              <div className="p-6 space-y-5 text-slate-200">
                <div>
                  <div className="text-xs text-slate-400">Tour Details</div>
                  <div className="mt-3 text-sm">
                    <div className="flex items-center justify-between"><span className="text-xs text-slate-400">Start</span><span className="font-medium">{formatDateISO(selectedDate)}</span></div>
                    <div className="flex items-center justify-between mt-2"><span className="text-xs text-slate-400">End</span><span className="font-medium">{formatDateISO(endDateIso() ?? undefined)}</span></div>

                    <div className="flex items-center justify-between mt-3"><span className="text-xs text-slate-400">From</span><span className="font-medium">{sidebarFrom}</span></div>
                    <div className="flex items-center justify-between mt-2"><span className="text-xs text-slate-400">To</span><span className="font-medium">{sidebarTo}</span></div>

                    {/* Aside badges: duration, guaranteed, countries */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-2 bg-white/6 text-slate-200 px-3 py-1 rounded-full text-sm">• {tour?.durationDays ?? itinerary.length} days</span>
                      {tour?.guaranteedDeparture && (
                        <span className="inline-flex items-center gap-2 bg-emerald-600/20 text-emerald-200 px-3 py-1 rounded-full text-sm">Guaranteed departure</span>
                      )}

                      {/* Countries list turned into clickable filter badges with tooltip (title) */}
                      {countriesVisited.length > 0 && countriesVisited.map((c) => (
                        <button
                          key={c}
                          title={`Filter timeline by ${c}`}
                          onClick={() => setCountryFilter((prev) => prev === c ? null : c)}
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm badge-filter ${countryFilter === c ? "badge-active bg-accent-yellow text-slate-900" : "bg-white/6 text-slate-200"}`}
                        >
                          {c}
                        </button>
                      ))}

                      {/* Clear filter control */}
                      {countryFilter && (
                        <button onClick={() => setCountryFilter(null)} className="text-xs underline text-slate-300 ml-2">Clear filter</button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3 text-xs text-slate-400">
                  <div>Duration</div>
                  <div className="text-base font-semibold text-slate-200">{computeDays()} Days</div>
                </div>

                <div className="border-t pt-3 text-xs text-slate-400">
                  <div className="flex items-center justify-between">
                    <div>
                      <div>Passengers</div>
                      <div className="text-base font-semibold text-slate-200">{passengers} Pax{includeInfant && infantCount > 0 ? ` + ${infantCount} Infant(s)` : ""}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Decrease passengers"
                        onClick={() => changePassengers(-1)}
                        className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-white/6 text-slate-200"
                      >
                        −
                      </button>
                      <input
                        aria-label="Passengers"
                        className="w-14 text-center rounded-md border px-2 py-1 text-sm bg-transparent text-slate-200"
                        value={passengers}
                        onChange={onPassengersInput}
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                      <button
                        type="button"
                        aria-label="Increase passengers"
                        onClick={() => changePassengers(1)}
                        className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-white/6 text-slate-200"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Infant toggle + count */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        id="infant-checkbox"
                        type="checkbox"
                        checked={includeInfant}
                        onChange={() => {
                          setIncludeInfant((p) => {
                            const next = !p;
                            if (!next) setInfantCount(1); // reset when disabling
                            return next;
                          });
                        }}
                        className="w-4 h-4"
                      />
                      <label htmlFor="infant-checkbox" className="text-sm text-slate-300">Include infant (price TBD)</label>
                    </div>

                    {includeInfant && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Decrease infants"
                          onClick={() => changeInfants(-1)}
                          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-white/6 text-slate-200"
                        >
                          −
                        </button>
                        <input
                          aria-label="Infants"
                          className="w-14 text-center rounded-md border px-2 py-1 text-sm bg-transparent text-slate-200"
                          value={infantCount}
                          onChange={onInfantsInput}
                          inputMode="numeric"
                          pattern="[0-9]*"
                        />
                        <button
                          type="button"
                          aria-label="Increase infants"
                          onClick={() => changeInfants(1)}
                          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-white/6 text-slate-200"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Per-person breakdown + total */}
                <div className="border-t pt-4">
                  <div className="flex flex-col gap-2">
                    {perPersonBreakdown.lines.map((ln, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="text-xs text-slate-400">{ln.label}</div>
                        <div className="text-sm font-semibold text-slate-200">{ln.value}</div>
                      </div>
                    ))}

                    {perPersonBreakdown.totalValue ? (
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="text-xs text-slate-400">{perPersonBreakdown.totalLabel}</div>
                        <div className="text-base font-semibold text-slate-200">{perPersonBreakdown.totalValue}</div>
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between pt-3">
                      <div className="text-xs text-slate-400">Total</div>
                      <div className="text-2xl font-extrabold text-slate-200">{formattedPrice()}</div>
                    </div>
                  </div>
                </div>

                {/* CTA block */}
                <div className="mt-6">
                  <div className="flex gap-3">
                    <Link
                      to={`/tour/${encodeURIComponent(tour?.slug ?? slug ?? "")}`}
                      className="flex-1 px-3 py-2 border rounded text-center text-sm hover:bg-white/6 text-slate-200"
                    >
                      Back to tour
                    </Link>

                    <Link
                      to={`/booking/${encodeURIComponent(tour?.slug ?? slug ?? "")}`}
                      state={{ tour, inlineInsert, selectedDate, passengers, perPerson: getCombinedPerPersonPrice().totalPerPerson }}
                      className={`flex-1 text-center px-3 py-2 rounded font-semibold text-sm ${canProceed ? "bg-accent-yellow text-slate-900 hover:bg-accent-yellow-600" : "bg-white/6 text-slate-400 cursor-not-allowed"}`}
                      aria-disabled={!canProceed}
                      onClick={(e) => {
                        if (!canProceed) e.preventDefault();
                      }}
                    >
                      BOOK NOW
                    </Link>
                  </div>
                </div>

              </div>
            </div>

            <div className="rounded-2xl card-glass p-5 text-sm text-slate-300 shadow-sm">Tip: Select a date to auto-select the full segment. Use the colored markers to fine-tune your join/leave days.</div>
          </aside>
        </div>
      </div>
      <BackToTop />
    </div>
  );
}