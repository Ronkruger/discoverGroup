import { useEffect, useState, type JSX } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import type { Tour } from "../types";
import { fetchTourBySlug } from "../api/tours";

/**
 * Booking (modern UI)
 *
 * - Route: /booking/:slug
 * - Supports navigation state: { tour?, selectedDate?, passengers?, perPerson? }
 * - 4-step flow: Review -> Lead details -> Payment -> Review & Confirm
 * - Responsive two-column layout (form left / summary right) that collapses on small screens
 * - Client-side validation and polished controls using Tailwind utility classes
 * - Mock payment inputs (no real payment)
 *
 * This file is intentionally self-contained and prioritizes UX: clear stepper, inline validation,
 * accessible form controls, and a friendly final confirmation navigation.
 */

function formatCurrencyPHP(amount: number) {
  return `PHP ${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Booking(): JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navState = (location.state ?? {}) as {
    tour?: Tour;
    selectedDate?: string;
    passengers?: number;
    perPerson?: number;
  } | undefined;

  const navigate = useNavigate();

  const [tour, setTour] = useState<Tour | null>(() => navState?.tour ?? null);
  const [loading, setLoading] = useState<boolean>(tour === null);
  const [selectedDate, setSelectedDate] = useState<string | null>(() => navState?.selectedDate ?? null);
  const [passengers, setPassengers] = useState<number>(() => navState?.passengers ?? 1);
  const [perPerson, setPerPerson] = useState<number>(() => navState?.perPerson ?? 0);

  // Booking flow state
  const [step, setStep] = useState<number>(0); // 0: review, 1: lead, 2: payment, 3: confirm
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lead details
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");

  // Payment (mock)
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [billingPostcode, setBillingPostcode] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (tour) {
        // derive perPerson if missing
        if (!perPerson) {
          const anyT = tour as unknown as {
            regularPricePerPerson?: number;
            promoPricePerPerson?: number;
            basePricePerDay?: number;
            durationDays?: number;
            itinerary?: unknown[];
          };
          const regular = typeof anyT.regularPricePerPerson === "number" ? anyT.regularPricePerPerson : undefined;
          const promo = typeof anyT.promoPricePerPerson === "number" ? anyT.promoPricePerPerson : undefined;
          const days = tour.durationDays ?? (tour.itinerary?.length ?? 0);
          const computed = Math.round((anyT.basePricePerDay ?? 0) * days);
          setPerPerson(regular ?? promo ?? computed);
        }
        setLoading(false);
        return;
      }

      if (!slug) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const fetched = await fetchTourBySlug(slug);
        if (!cancelled) {
          setTour(fetched);
          if (fetched && !perPerson) {
            const anyT = fetched as unknown as {
              regularPricePerPerson?: number;
              promoPricePerPerson?: number;
              basePricePerDay?: number;
              durationDays?: number;
              itinerary?: unknown[];
            };
            const regular = typeof anyT.regularPricePerPerson === "number" ? anyT.regularPricePerPerson : undefined;
            const promo = typeof anyT.promoPricePerPerson === "number" ? anyT.promoPricePerPerson : undefined;
            const days = fetched.durationDays ?? (fetched.itinerary?.length ?? 0);
            const computed = Math.round((anyT.basePricePerDay ?? 0) * days);
            setPerPerson(regular ?? promo ?? computed);
          }
          // if navState provided a date/passenger override use them
          if (navState?.selectedDate) setSelectedDate(navState.selectedDate);
          if (navState?.passengers) setPassengers(navState.passengers);
        }
      } catch (err) {
        console.error("fetchTourBySlug failed", err);
        if (!cancelled) setTour(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
    // intentionally ignoring exhaustive-deps here to avoid refetch loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const total = (perPerson ?? 0) * Math.max(1, passengers);

  function validateStep(current: number): string | null {
    if (current === 0) {
      if (!selectedDate) return "Please choose a travel date before continuing.";
      if (!passengers || passengers < 1) return "Please enter number of passengers.";
      return null;
    }
    if (current === 1) {
      if (!leadName.trim()) return "Please enter the lead passenger's name.";
      if (!leadEmail.trim() || !/^\S+@\S+\.\S+$/.test(leadEmail)) return "Please enter a valid email.";
      return null;
    }
    if (current === 2) {
      if (!cardNumber.trim() || cardNumber.replace(/\s+/g, "").length < 12) return "Please enter a valid card number.";
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) return "Expiry must be in MM/YY format.";
      if (!/^\d{3,4}$/.test(cardCvc)) return "CVC is required.";
      return null;
    }
    return null;
  }

  async function handleNext() {
    setError(null);
    const v = validateStep(step);
    if (v) {
      setError(v);
      return;
    }
    if (step < 3) setStep((s) => s + 1);
  }

  function handleBack() {
    setError(null);
    if (step > 0) setStep((s) => s - 1);
  }

  async function handleConfirm(e?: React.FormEvent) {
    if (e) e.preventDefault();
    // final validations
    for (let s = 0; s <= 2; s++) {
      const v = validateStep(s);
      if (v) {
        setStep(s);
        setError(v);
        return;
      }
    }

    setSubmitting(true);
    setError(null);
    try {
      // simulate API call
      await new Promise((r) => setTimeout(r, 800));
      const bookingId = `BK-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
      navigate("/booking/confirmation", {
        state: {
          bookingId,
          tourTitle: tour?.title ?? slug,
          country: tour?.additionalInfo?.countriesVisited?.[0] ?? "",
          date: selectedDate,
          passengers,
          perPerson,
          total,
        },
      });
    } catch (err) {
      console.error("booking failed", err);
      setError("Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="container mx-auto px-5 py-12 text-center text-slate-600">Loading booking details…</div>;

  if (!tour) {
    return (
      <main className="container mx-auto px-5 py-12">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow text-center">
          <h2 className="text-xl font-semibold mb-2">Tour not found</h2>
          <p className="text-slate-600 mb-4">We couldn't find that tour. Go back to browse other routes.</p>
          <Link to="/routes" className="inline-block px-4 py-2 bg-rose-600 text-white rounded">Browse routes</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-5 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Form / Steps */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border rounded-lg shadow-sm p-4">
            {/* Stepper */}
            <div className="flex items-center gap-4">
              {["Review", "Lead details", "Payment", "Confirm"].map((label, i) => (
                <div key={label} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                      ${i === step ? "bg-rose-600 text-white" : i < step ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"}`}
                  >
                    {i + 1}
                  </div>
                  <div className={`hidden sm:block text-sm ${i === step ? "text-slate-900 font-semibold" : "text-slate-500"}`}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border rounded-lg shadow-sm p-6">
            {/* Step content */}
            {step === 0 && (
              <section aria-labelledby="review-heading">
                <h2 id="review-heading" className="text-lg font-semibold mb-3">Review your selection</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-slate-500">Tour</div>
                    <div className="font-semibold">{tour.title}</div>
                    <div className="text-sm text-slate-600 mt-1">{tour.summary}</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">Date</div>
                    <select value={selectedDate ?? ""} onChange={(e) => setSelectedDate(e.target.value)} className="mt-1 w-full border rounded px-3 py-2">
                      {tour.travelWindow ? (
                        <>
                          <option value={tour.travelWindow.start}>{new Date(tour.travelWindow.start).toDateString()}</option>
                          <option value={tour.travelWindow.end}>{new Date(tour.travelWindow.end).toDateString()}</option>
                        </>
                      ) : tour.departureDates && tour.departureDates.length > 0 ? (
                        tour.departureDates.map((d) => <option key={d} value={d}>{new Date(d).toDateString()}</option>)
                      ) : (
                        <option value="">No dates available</option>
                      )}
                    </select>
                    <div className="text-xs text-slate-500 mt-3">Passengers</div>
                    <input type="number" min={1} value={passengers} onChange={(e) => setPassengers(Math.max(1, Number(e.target.value)))} className="mt-1 w-32 border rounded px-3 py-2" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">Per person</div>
                  <div className="text-lg font-semibold text-slate-900">{formatCurrencyPHP(perPerson)}</div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => navigate(-1)} className="px-4 py-2 border rounded">Back</button>
                  <button onClick={handleNext} className="px-4 py-2 bg-rose-600 text-white rounded">Continue</button>
                </div>
              </section>
            )}

            {step === 1 && (
              <section aria-labelledby="lead-heading">
                <h2 id="lead-heading" className="text-lg font-semibold mb-3">Lead passenger details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input placeholder="Full name" value={leadName} onChange={(e) => setLeadName(e.target.value)} className="border rounded px-3 py-2" />
                  <input placeholder="Email address" type="email" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} className="border rounded px-3 py-2" />
                  <input placeholder="Phone (optional)" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} className="border rounded px-3 py-2" />
                  <input placeholder="Passport or ID (optional)" className="border rounded px-3 py-2" />
                </div>

                <div className="mt-6 flex justify-between">
                  <button onClick={handleBack} className="px-4 py-2 border rounded">Back</button>
                  <div className="flex gap-3">
                    <button onClick={() => { setLeadName(""); setLeadEmail(""); setLeadPhone(""); }} className="px-4 py-2 border rounded">Reset</button>
                    <button onClick={handleNext} className="px-4 py-2 bg-rose-600 text-white rounded">Continue to payment</button>
                  </div>
                </div>
              </section>
            )}

            {step === 2 && (
              <section aria-labelledby="payment-heading">
                <h2 id="payment-heading" className="text-lg font-semibold mb-3">Payment</h2>
                <div className="text-sm text-slate-500 mb-3">This is a mock payment form for demo purposes — no real card processing is performed.</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input placeholder="Card number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="border rounded px-3 py-2" inputMode="numeric" />
                  <input placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} className="border rounded px-3 py-2" />
                  <input placeholder="CVC" value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} className="border rounded px-3 py-2" />
                  <input placeholder="Billing postcode" value={billingPostcode} onChange={(e) => setBillingPostcode(e.target.value)} className="border rounded px-3 py-2" />
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <button onClick={handleBack} className="px-4 py-2 border rounded">Back</button>
                  <button onClick={handleNext} className="px-4 py-2 bg-rose-600 text-white rounded">Review booking</button>
                </div>
              </section>
            )}

            {step === 3 && (
              <section aria-labelledby="confirm-heading">
                <h2 id="confirm-heading" className="text-lg font-semibold mb-3">Review & confirm</h2>
                <div className="bg-slate-50 border rounded p-4">
                  <div className="flex justify-between">
                    <div>
                      <div className="text-xs text-slate-500">Tour</div>
                      <div className="font-semibold">{tour.title}</div>
                      <div className="text-sm text-slate-600 mt-1">{tour.summary}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Date</div>
                      <div className="font-semibold">{selectedDate ? new Date(selectedDate).toDateString() : "—"}</div>
                      <div className="text-xs text-slate-500 mt-2">Passengers</div>
                      <div className="font-semibold">{passengers}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-slate-600">Per person</div>
                    <div className="font-semibold">{formatCurrencyPHP(perPerson)}</div>
                  </div>
                  <div className="mt-1 flex justify-between items-center">
                    <div className="text-sm text-slate-600">Total</div>
                    <div className="text-2xl font-bold text-rose-600">{formatCurrencyPHP(total)}</div>
                  </div>
                </div>

                <form onSubmit={handleConfirm}>
                  <div className="mt-6 flex justify-between items-center">
                    <button type="button" onClick={handleBack} className="px-4 py-2 border rounded">Back</button>
                    <div className="flex items-center gap-3">
                      {error && <div className="text-rose-600 mr-2">{error}</div>}
                      <button type="submit" disabled={submitting} className="px-4 py-2 bg-rose-600 text-white rounded">
                        {submitting ? "Confirming…" : `Confirm booking — ${formatCurrencyPHP(total)}`}
                      </button>
                    </div>
                  </div>
                </form>
              </section>
            )}
          </div>
        </div>

        {/* Right column: Summary */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="sticky top-24">
            <div className="bg-white border rounded-lg p-5 shadow">
              <img src={tour.images?.[0] ?? "/assets/placeholder.jpg"} alt={tour.title} className="w-full h-40 object-cover rounded" />
              <div className="mt-4">
                <div className="text-xs text-slate-500">Your booking</div>
                <div className="text-lg font-semibold">{tour.title}</div>
                <div className="text-sm text-slate-600 mt-1">{tour.line ?? ""} • {tour.durationDays ?? tour.itinerary?.length ?? 0} days</div>

                <div className="mt-4 text-sm text-slate-600 space-y-2">
                  <div><strong>Date:</strong> <span className="ml-2">{selectedDate ? new Date(selectedDate).toDateString() : "—"}</span></div>
                  <div><strong>Passengers:</strong> <span className="ml-2">{passengers}</span></div>
                  <div><strong>Per head:</strong> <span className="ml-2 font-semibold">{formatCurrencyPHP(perPerson)}</span></div>
                  <div className="pt-2 border-t mt-2">
                    <div className="text-xs text-slate-500">Total</div>
                    <div className="text-2xl font-bold text-rose-600">{formatCurrencyPHP(total)}</div>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <Link to={`/tour/${tour.slug}`} className="flex-1 px-3 py-2 border rounded text-center">Back to tour</Link>
                  <button onClick={() => { setStep(3); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="px-3 py-2 bg-rose-600 text-white rounded">Proceed</button>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-white border rounded p-4 text-sm text-slate-600">
              <div className="font-semibold mb-2">Need help?</div>
              <div>Call reservations: <strong>+63 02 8526 8404</strong></div>
              <div className="mt-2">Email: <a href="mailto:reservations@example.com" className="text-rose-600 underline">reservations@example.com</a></div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}