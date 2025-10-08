"use strict";
// apps/admin/src/services/tourRepo.ts
// Frontend "repo" for the Admin UI — talks to the HTTP API (not Prisma).
// This must run in the browser, so it uses fetch and the client-side apiClient.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTours = getAllTours;
exports.getTourById = getTourById;
exports.createTour = createTour;
exports.updateTour = updateTour;
exports.deleteTour = deleteTour;
const api = __importStar(require("./apiClient"));
async function getAllTours() {
    return (await api.fetchTours());
}
async function getTourById(id) {
    const res = (await api.fetchTours());
    const found = res.find((t) => String(t.id) === String(id));
    return found ?? null;
}
async function createTour(data) {
    return api.createTour(data);
}
async function updateTour(id, data) {
    const res = await fetch(`${import.meta.env.VITE_ADMIN_API_URL ?? "http://localhost:4000"}/admin/tours/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        if (res.status === 404)
            throw new Error("not found");
        throw new Error("Failed to update tour");
    }
    return (await res.json());
}
async function deleteTour(id) {
    const res = await fetch(`${import.meta.env.VITE_ADMIN_API_URL ?? "http://localhost:4000"}/admin/tours/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) {
        if (res.status === 404)
            throw new Error("not found");
        throw new Error("Failed to delete tour");
    }
}
