"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTours = fetchTours;
exports.fetchTourById = fetchTourById;
exports.createTour = createTour;
exports.updateTour = updateTour;
exports.deleteTour = deleteTour;
const API_BASE = import.meta.env.VITE_ADMIN_API_URL ?? "http://localhost:4000";
// List all tours
async function fetchTours() {
    const res = await fetch(`${API_BASE}/admin/tours`, {
        headers: { "Accept": "application/json" },
    });
    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`Failed to fetch tours: ${res.status} ${text}`);
    }
    return (await res.json());
}
// Get a single tour by id (or slug) — pages expect fetchTourById
async function fetchTourById(id) {
    const res = await fetch(`${API_BASE}/admin/tours/${id}`, {
        headers: { "Accept": "application/json" },
    });
    if (res.status === 404)
        return null;
    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`Failed to fetch tour ${id}: ${res.status} ${text}`);
    }
    return (await res.json());
}
// Create a new tour
async function createTour(data) {
    const res = await fetch(`${API_BASE}/admin/tours`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`Failed to create tour: ${res.status} ${text}`);
    }
    return (await res.json());
}
// Update an existing tour
async function updateTour(id, data) {
    const res = await fetch(`${API_BASE}/admin/tours/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        if (res.status === 404)
            throw new Error("not found");
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`Failed to update tour ${id}: ${res.status} ${text}`);
    }
    return (await res.json());
}
// Delete a tour
async function deleteTour(id) {
    const res = await fetch(`${API_BASE}/admin/tours/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) {
        if (res.status === 404)
            throw new Error("not found");
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`Failed to delete tour ${id}: ${res.status} ${text}`);
    }
}
