// Browser-safe client used by the Admin UI to call the API.
import type { Tour } from "@discovergroup/types";
export type { Tour };
export type TourPayload = Partial<Tour>;

// Prefer the admin-specific env var, fall back to the general VITE_API_URL, then localhost for dev
// Safely attempt to read import.meta.env without directly using the import.meta meta-property
// (avoid TypeScript compile errors when outputting CommonJS) by calling it at runtime.
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

// List all tours
export async function fetchTours(): Promise<Tour[]> {
  const res = await fetch(`${API_BASE}/admin/tours`, {
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to fetch tours: ${res.status} ${text}`);
  }
  return (await res.json()) as Tour[];
}

// Get a single tour by id (or slug) — pages expect fetchTourById
export async function fetchTourById(id: string | number): Promise<Tour | null> {
  const res = await fetch(`${API_BASE}/admin/tours/${id}`, {
    headers: { "Accept": "application/json" },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to fetch tour ${id}: ${res.status} ${text}`);
  }
  return (await res.json()) as Tour;
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
  return (await res.json()) as Tour;
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
  return (await res.json()) as Tour;
}

// Delete a tour
export async function deleteTour(id: string | number): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/tours/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("not found");
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to delete tour ${id}: ${res.status} ${text}`);
  }
}