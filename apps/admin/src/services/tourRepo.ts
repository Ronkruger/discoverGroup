// apps/admin/src/services/tourRepo.ts
// Frontend "repo" for the Admin UI — talks to the HTTP API (not Prisma).
// This must run in the browser, so it uses fetch and the client-side apiClient.

import * as api from "./apiClient";
import type { Tour } from "@discovergroup/types";

export async function getAllTours(): Promise<Tour[]> {
  return (await api.fetchTours()) as unknown as Tour[];
}

export async function getTourById(id: string | number): Promise<Tour | null> {
  const res = (await api.fetchTours()) as unknown as Tour[];
  const found = res.find((t) => String((t as any).id) === String(id));
  return found ?? null;
}

export async function createTour(data: api.TourPayload): Promise<Tour> {
  return api.createTour(data);
}

export async function updateTour(id: string | number, data: Partial<Tour>): Promise<Tour> {
  const res = await fetch(`${(import.meta.env.VITE_ADMIN_API_URL as string) ?? "http://localhost:4000"}/admin/tours/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("not found");
    throw new Error("Failed to update tour");
  }
  return (await res.json()) as Tour;
}

export async function deleteTour(id: string | number): Promise<void> {
  const res = await fetch(`${(import.meta.env.VITE_ADMIN_API_URL as string) ?? "http://localhost:4000"}/admin/tours/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("not found");
    throw new Error("Failed to delete tour");
  }
}