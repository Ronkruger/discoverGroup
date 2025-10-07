import { useLocation, Link } from "react-router-dom";
import type { JSX } from "react";
import React, { useEffect } from "react";
import confetti from "canvas-confetti";

/**
 * Booking confirmation page
 * - Route: /booking/confirmation
 * - Expects location.state with booking summary:
 *   { bookingId, tourTitle, country, date, passengers, perPerson, total }
 */

export default function BookingConfirmation(): JSX.Element {
  const location = useLocation();
  const state = (location.state ?? {}) as {
    bookingId?: string;
    tourTitle?: string;
    country?: string;
    date?: string;
    passengers?: number;
    perPerson?: number;
    total?: number;
  };

  // Confetti burst on mount!
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      zIndex: 9999,
    });
  }, []);

  if (!state.bookingId) {
    return (
      <main className="container mx-auto px-5 py-10">
        <div className="p-6 bg-white border rounded text-slate-700">
          No booking data available. If you just completed a booking please check your email, otherwise return to the tours list.
        </div>
        <div className="mt-4">
          <Link to="/" className="text-rose-600 underline">Home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-5 py-10">
      <div className="bg-white border rounded shadow-sm p-8">
        <h1 className="text-2xl font-semibold mb-2">Booking confirmed</h1>
        <p className="text-slate-600 mb-4">Thank you — your booking is confirmed. A confirmation email will be sent shortly.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-slate-500">Booking reference</div>
            <div className="text-lg font-semibold">{state.bookingId}</div>
            <div className="text-sm text-slate-600 mt-2">{state.tourTitle}</div>
            <div className="text-sm text-slate-600">{state.country}</div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Travel date</div>
            <div className="text-lg font-semibold">{state.date ? new Date(state.date).toDateString() : "—"}</div>

            <div className="mt-3 text-sm text-slate-500">Passengers</div>
            <div className="text-lg font-semibold">{state.passengers ?? "—"}</div>

            <div className="mt-3 text-sm text-slate-500">Total paid</div>
            <div className="text-lg font-semibold">PHP {(state.total ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Link to="/" className="px-4 py-2 bg-rose-600 text-white rounded">Return Home</Link>
          <Link to="/routes" className="px-4 py-2 border rounded">Browse other routes</Link>
        </div>
      </div>
    </main>
  );
}