import axios from "axios";

const API_BASE = process.env.REACT_APP_ADMIN_API_URL ?? "http://localhost:4000";

export interface Tour {
  id: string;
  name: string;
  description?: string;
  // Add other fields as needed
}

export async function fetchTours(): Promise<Tour[]> {
  const resp = await axios.get<Tour[]>(`${API_BASE}/admin/tours`);
  return resp.data || [];
}

export async function createTour(payload: TourPayload) {
  const resp = await axios.post(`${API_BASE}/admin/tours`, payload);
  return resp.data;
}

export async function fetchTourById(id: string) {
  const resp = await axios.get(`${API_BASE}/admin/tours/${id}`);
  return resp.data;
}

export interface TourPayload {
  // Define the properties of the tour payload here
  name: string;
  description?: string;
  // Add other fields as needed
}

export async function updateTour(id: string, payload: TourPayload) {
  const resp = await axios.put(`${API_BASE}/admin/tours/${id}`, payload);
  return resp.data;
}