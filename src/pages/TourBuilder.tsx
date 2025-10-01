import { useNavigate, useParams, Link } from "react-router-dom";
import { useEffect, useRef, useState, type JSX, type ChangeEvent } from "react";
import type { Tour, Stop } from "../types";
import { fetchTourBySlug, fetchTours } from "../api/tours";

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
      setTour(null);
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

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen py-10">
      <div ref={pageTopRef} />
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-12">
          <div className="space-y-8">
            <section className="relative rounded-3xl border border-slate-200 bg-white shadow-sm overflow-visible p-6" aria-label="Timeline">
              <div ref={railRef} className="absolute left-28 top-12 bottom-12 w-1.5 rounded-full bg-slate-200" />

              {verticalBars.map((b, i) => (
                <div key={`bar-${i}`} aria-hidden style={{ position: "absolute", left: `${b.x}px`, top: `${b.top}px`, height: `${b.height}px`, width: 12, borderRadius: 8, background: b.color, boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)", zIndex: 6 }} />
              ))}

              {connectors.map((c, i) => (
                <div key={`conn-${i}`} aria-hidden style={{ position: "absolute", left: `${c.left}px`, top: `${c.top}px`, height: 8, width: `${c.width}px`, borderRadius: 8, background: c.gradient, opacity: 0.9, zIndex: 7 }} />
              ))}

              <div className="space-y-8">
                {Array.from({ length: finalLength }).map((_, idx) => {
                  const stop = finalDayStops[idx];
                  const cityName = stop?.city ?? "";
                  const included = joinIndex !== null && leaveIndex !== null && idx >= joinIndex && idx <= leaveIndex;
                  const isEnd = stop?.isEnd ?? false;
                  const entries = finalPlacesPerDay[idx] ?? [];

                  const setRowRef = (el: HTMLDivElement | null) => { rowRefs.current[idx] = el; };

                  return (
                    <div id={`tb-row-${idx}`} key={`day-${idx}`} ref={setRowRef} className="relative flex items-start gap-6 pb-10 border-b last:border-b-0">
                      <div className="w-28 flex flex-col items-center justify-start pt-1 text-left">
                        <div className="text-xs font-semibold text-slate-700">{formatWeekday(dateForDayIndex(idx))}</div>
                        <div className="text-xs text-slate-400 mt-1">{formatMonthDay(dateForDayIndex(idx))}</div>
                      </div>

                      <div className="absolute left-24 top-6">
                        <button onClick={() => onMarkerClick(idx)} className={`w-10 h-10 rounded-full grid place-items-center ring-2 transition-transform transform hover:scale-105 ${included ? "bg-blue-600 ring-blue-600 text-white" : "bg-white ring-slate-200 text-slate-300"}`} aria-label={`Set segment point for day ${idx + 1}`}>
                          <span className={`block w-4 h-4 rounded-full ${included ? "bg-white" : "bg-slate-200"}`} />
                        </button>
                      </div>

                      <div className={`flex-1 ${included ? "" : "opacity-95"}`}>
                        <div className="flex items-start justify-between">
                          <div className="min-w-0">
                            <div className="text-base font-semibold text-slate-900 truncate">{cityName || `Day ${idx + 1}`}</div>
                          </div>

                          <div className="flex items-center gap-3">
                            {((idx === (itinerary.length - 1)) || isEnd) && (
                              <div className="flex items-center gap-2">
                                <button onClick={() => openInlineChangeAt(idx)} className="text-xs px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200">CHANGE LINE</button>
                                <span className={`text-xs px-3 py-1 rounded-full text-white ${lineColorClassMap[tour.line ?? "DEFAULT"]}`}>{tour.line}</span>
                              </div>
                            )}
                            {isEnd && <div className="px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-700 ml-2">END TOUR HERE</div>}
                          </div>
                        </div>

                        {idx > 0 && <div className="mt-3"><span className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold">TRAVEL HERE</span></div>}

                        <div className="mt-4">
                          <div className={`p-6 rounded-2xl border ${included ? "bg-white shadow-xl" : "bg-white/95"} border-slate-100`}>
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-semibold text-slate-900">Day {idx + 1}</div>
                              <div className="text-xs text-slate-400">{/* optional small info */}</div>
                            </div>

                            <div className="mt-4 flex items-center gap-3">
                              <button onClick={() => setJoinIndex(idx)} className="text-sm px-3 py-2 rounded-lg border hover:bg-slate-50">Set as join</button>
                              <button onClick={() => setLeaveIndex(idx)} className="text-sm px-3 py-2 rounded-lg border hover:bg-slate-50">Set as leave</button>
                            </div>
                          </div>
                        </div>

                        {expandedChangeAt === idx && (
                          <div id={`change-panel-${idx}`} className="mt-4 border rounded-2xl bg-slate-50 p-4 shadow-sm">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-slate-500 mb-3">SELECT ROUTE TO JOIN</div>
                                <div className="space-y-2 max-h-44 overflow-auto pr-2">
                                  {allTours.map((t) => {
                                    const cls = lineColorClassMap[t.line ?? "DEFAULT"];
                                    return (
                                      <div key={t.slug} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border hover:shadow-sm transition">
                                        <div className="flex items-center gap-3">
                                          <span className={`w-3.5 h-3.5 rounded-full ${cls}`} />
                                          <div className="text-sm text-slate-800">{t.title}</div>
                                        </div>
                                        <button type="button" onClick={() => insertRouteInline(t.slug)} className="text-sm text-blue-700 hover:text-blue-900 underline">Insert</button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              <div>
                                <div className="text-xs text-slate-500 mb-3">SELECT JOINING POINT (preview)</div>
                                {inlineInsert ? (
                                  <div className="bg-white border rounded-lg p-3">
                                    <div className="text-sm font-semibold text-slate-800 mb-2">{inlineInsert.tour.title}</div>
                                    <div className="divide-y">
                                      {inlineInsert.tour.fullStops?.map((s, i) => (
                                        <div key={i} className="flex items-center justify-between py-2">
                                          <span className="text-sm text-slate-700">{(s as Stop).city}</span>
                                          <button onClick={() => { setJoinIndex(idx + 1 + i); setLeaveIndex(Math.max(idx + 1 + i, leaveIndex ?? idx)); removeInlineInsert(); }} className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200">Select</button>
                                        </div>
                                      ))}
                                    </div>

                                    <div className="mt-3 flex justify-between items-center">
                                      <div className="text-xs text-slate-500">Preview inserted inline</div>
                                      <button onClick={removeInlineInsert} className="text-xs text-rose-600 hover:text-rose-800 underline">Remove preview</button>
                                    </div>
                                  </div>
                                ) : <div className="text-sm text-slate-500">Choose a route to preview stops</div>}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="w-40 flex flex-col items-start gap-2 pl-4">
                        {entries && entries.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {entries.map((p, i) => (
                              <div key={`${idx}-${i}`} className="flex items-center gap-3">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.colorHex }} />
                                <span className="text-xs text-slate-500 truncate" style={{ maxWidth: 120 }}>{p.city}</span>
                              </div>
                            ))}
                          </div>
                        ) : <div className="text-xs text-slate-400">—</div>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reset segment control (visible when a segment is selected) */}
              {(joinIndex !== null || leaveIndex !== null) && (
                <div className="flex justify-center mt-6">
                  <button onClick={resetSegment} className="w-12 h-12 rounded-full bg-slate-900 text-white grid place-items-center shadow-lg hover:scale-105 transition-transform" title="Reset segment" type="button">✕</button>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border bg-white/80 backdrop-blur shadow-lg overflow-hidden">
              <img src={tour.images?.[0] ?? "/assets/placeholder.jpg"} alt={tour.title} className="w-full h-36 object-cover" />
              <div className="p-6 space-y-5">
                <div>
                  <div className="text-xs text-slate-500">Tour Details</div>
                  <div className="mt-3 text-sm text-slate-800">
                    <div className="flex items-center justify-between"><span className="text-xs text-slate-500">Start</span><span className="font-medium">{formatDateISO(selectedDate)}</span></div>
                    <div className="flex items-center justify-between mt-2"><span className="text-xs text-slate-500">End</span><span className="font-medium">{formatDateISO(endDateIso() ?? undefined)}</span></div>

                    <div className="flex items-center justify-between mt-3"><span className="text-xs text-slate-500">From</span><span className="font-medium">{sidebarFrom}</span></div>
                    <div className="flex items-center justify-between mt-2"><span className="text-xs text-slate-500">To</span><span className="font-medium">{sidebarTo}</span></div>
                  </div>
                </div>

                <div className="border-t pt-3 text-xs text-slate-500">
                  <div>Duration</div>
                  <div className="text-base font-semibold text-slate-900">{computeDays()} Days</div>
                </div>

                <div className="border-t pt-3 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <div>Passengers</div>
                      <div className="text-base font-semibold text-slate-900">{passengers} Pax{includeInfant && infantCount > 0 ? ` + ${infantCount} Infant(s)` : ""}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Decrease passengers"
                        onClick={() => changePassengers(-1)}
                        className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-slate-50"
                      >
                        −
                      </button>
                      <input
                        aria-label="Passengers"
                        className="w-14 text-center rounded-md border px-2 py-1 text-sm"
                        value={passengers}
                        onChange={onPassengersInput}
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                      <button
                        type="button"
                        aria-label="Increase passengers"
                        onClick={() => changePassengers(1)}
                        className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-slate-50"
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
                      <label htmlFor="infant-checkbox" className="text-sm text-slate-600">Include infant (price TBD)</label>
                    </div>

                    {includeInfant && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Decrease infants"
                          onClick={() => changeInfants(-1)}
                          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-slate-50"
                        >
                          −
                        </button>
                        <input
                          aria-label="Infants"
                          className="w-14 text-center rounded-md border px-2 py-1 text-sm"
                          value={infantCount}
                          onChange={onInfantsInput}
                          inputMode="numeric"
                          pattern="[0-9]*"
                        />
                        <button
                          type="button"
                          aria-label="Increase infants"
                          onClick={() => changeInfants(1)}
                          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-slate-50"
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
                        <div className="text-xs text-slate-500">{ln.label}</div>
                        <div className="text-sm font-semibold text-slate-900">{ln.value}</div>
                      </div>
                    ))}

                    {perPersonBreakdown.totalValue ? (
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="text-xs text-slate-500">{perPersonBreakdown.totalLabel}</div>
                        <div className="text-base font-semibold text-slate-900">{perPersonBreakdown.totalValue}</div>
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between pt-3">
                      <div className="text-xs text-slate-500">Total</div>
                      <div className="text-2xl font-extrabold text-slate-900">{formattedPrice()}</div>
                    </div>
                  </div>
                </div>

                {/* CTA block */}
                <div className="mt-6">
                  <div className="flex gap-3">
                    <Link
                      to={`/tour/${encodeURIComponent(tour?.slug ?? slug ?? "")}`}
                      className="flex-1 px-3 py-2 border rounded text-center text-sm hover:bg-slate-50"
                    >
                      Back to tour
                    </Link>

                    <Link
                      to={`/booking/${encodeURIComponent(tour?.slug ?? slug ?? "")}`}
                      state={{ tour, inlineInsert, selectedDate, passengers, perPerson: getCombinedPerPersonPrice().totalPerPerson }}
                      className={`flex-1 text-center px-3 py-2 rounded font-semibold text-sm ${canProceed ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
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

            <div className="rounded-2xl border bg-white/85 backdrop-blur p-5 text-sm text-slate-600 shadow-sm">Tip: Select a date to auto-select the full segment. Use the colored markers to fine-tune your join/leave days.</div>
          </aside>
        </div>
      </div>
    </div>
  );
}