// Browser-safe client used by the Admin UI to call the API.
import type { Tour } from "@discovergroup/types";
export type { Tour };
export type TourPayload = Partial<Tour>;

// Prefer the admin-specific env var, fall back to the general VITE_API_URL, then localhost for dev
let _env: Record<string, unknown> = {};
try {
  const getImportMetaEnv = new Function(
    'try { return import.meta.env } catch (e) { return undefined }'
  ) as () => Record<string, unknown> | undefined;
  _env = getImportMetaEnv() || {};
} catch {
  _env = {};
}
const API_BASE = (_env.VITE_ADMIN_API_URL as string) || (_env.VITE_API_URL as string) || "http://localhost:4000";

// Helper to extract a stable id string from a returned tour object.
// Prefer the Mongo _id where possible (it may be a string or an object like { $oid: '...' }).
interface RawTourData {
  _id?: string | { $oid: string } | unknown;
  id?: string | unknown;
  slug?: string | unknown;
}

function extractStableId(raw: Record<string, unknown>): string | undefined {
  const rawData = raw as RawTourData;
  const rawId = rawData._id ?? rawData.id ?? rawData.slug;
  if (rawId === undefined || rawId === null) return undefined;
  if (typeof rawId === "string") return rawId;
  if (typeof rawId === "object") {
    const objId = rawId as { $oid?: string };
    if ("$oid" in objId && typeof objId.$oid === "string") return objId.$oid;
  }
  return String(rawId);
}

// Normalize a returned tour so the client always has `id` (string) and preserves additionalInfo fields.
function normalizeTour(raw: Record<string, unknown>): Tour {
  const stableId = extractStableId(raw);
  const normalized: Record<string, unknown> = {
    ...raw,
    id: stableId ?? raw.id,
  };

  // Ensure additionalInfo exists and countries array preserved if present
  normalized.additionalInfo = normalized.additionalInfo || {};
  if (
    raw.additionalInfo &&
    typeof raw.additionalInfo === "object" &&
    Array.isArray((raw.additionalInfo as { countries?: unknown[] }).countries)
  ) {
    if (typeof normalized.additionalInfo !== "object" || normalized.additionalInfo === null) {
      normalized.additionalInfo = {};
    }
    (normalized.additionalInfo as { countries?: unknown[] }).countries = (raw.additionalInfo as { countries?: unknown[] }).countries;
  }

  // Keep bookingPdfUrl (used for Flipbook links)
  if ("bookingPdfUrl" in raw) normalized.bookingPdfUrl = raw.bookingPdfUrl;

  return normalized as Tour;
}

// List all tours
export async function fetchTours(): Promise<Tour[]> {
  const res = await fetch(`${API_BASE}/admin/tours`, {
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to fetch tours: ${res.status} ${text}`);
  }
  const data = await res.json();
  const normalized = (data || []).map((t: Record<string, unknown>) => normalizeTour(t));

  try {
    if (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
      console.debug(
        '[admin apiClient] fetchTours ->',
        normalized.length,
        'tours',
        normalized.map((x: Tour) => ({ id: x.id, slug: (x as unknown as { slug?: string }).slug, _id: (x as unknown as { _id?: string })._id, bookingPdfUrl: (x as unknown as { bookingPdfUrl?: string }).bookingPdfUrl }))
      );
    }
  } catch {
    console.debug(
      '[admin apiClient] fetchTours ->',
      normalized.length,
      'tours',
      normalized.map((x: Tour) => ({ id: x.id, slug: (x as unknown as { slug?: string }).slug, _id: (x as unknown as { _id?: string })._id, bookingPdfUrl: x.bookingPdfUrl }))
    );
  }
  return normalized;
}

// Get a single tour by id (or slug)
export async function fetchTourById(id: string | number): Promise<Tour | null> {
  const res = await fetch(`${API_BASE}/admin/tours/${id}`, {
    headers: { "Accept": "application/json" },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to fetch tour ${id}: ${res.status} ${text}`);
  }
  const raw = await res.json();
  return normalizeTour(raw);
}

// Create a new tour
export async function createTour(data: TourPayload): Promise<Tour> {
  const res = await fetch(`${API_BASE}/admin/tours`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to create tour: ${res.status} ${text}`);
  }
  const raw = await res.json();
  return normalizeTour(raw);
}

// Update an existing tour
export async function updateTour(id: string | number, data: TourPayload): Promise<Tour> {
  const res = await fetch(`${API_BASE}/admin/tours/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("not found");
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to update tour ${id}: ${res.status} ${text}`);
  }
  const raw = await res.json();
  return normalizeTour(raw);
}

// Delete a tour
export async function deleteTour(id: string | number): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/tours/${id}`, {
    method: "DELETE",
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("not found");
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to delete tour ${id}: ${res.status} ${text}`);
  }
}