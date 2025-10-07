import { useEffect, useState, type JSX } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import type { Tour } from "../types";
import { fetchTourBySlug } from "../api/tours";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { stripePromise } from "../lib/stripe";
import { createPaymentIntent } from "../api/payments";
import React from "react";

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
  const [step, setStep] = useState<number>(0); // 0: review, 1: lead, 2: payment, 3: review, 4: confirm/pay
  const [error, setError] = useState<string | null>(null);

  // Stripe state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [initializingPayment, setInitializingPayment] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (tour) {
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
  }, [navState.passengers, navState.selectedDate, perPerson, slug, tour]);

  const total = (perPerson ?? 0) * Math.max(1, passengers);

  // Initialize PaymentIntent when entering Step 2 (Payment)
  useEffect(() => {
    let cancelled = false;

    async function initPayment() {
      if (step !== 2) return;
      setError(null);
      setInitializingPayment(true);
      setClientSecret(null);

      try {
        const { clientSecret: cs } = await createPaymentIntent({
          amount: Math.round(total * 100), // PHP in centavos
          currency: "php",
          metadata: {
            slug: slug ?? "",
            tourTitle: tour?.title ?? "",
            date: selectedDate ?? "",
            passengers: String(passengers ?? 1),
          },
        });
        if (!cancelled) {
          setClientSecret(cs);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          console.error(e);
          const message =
            e instanceof Error ? e.message :
            typeof e === "string" ? e :
            JSON.stringify(e as object) || "Unable to initialize payment. Please try again.";
          setError(message);
        }
      } finally {
        if (!cancelled) setInitializingPayment(false);
      }
    }

    void initPayment();
    return () => {
      cancelled = true;
    };
  }, [step, total, selectedDate, passengers, slug, tour?.title]);

  function validateStep(current: number): string | null {
    if (current === 0) {
      if (!selectedDate) return "Please choose a travel date before continuing.";
      if (!passengers || passengers < 1) return "Please enter number of passengers.";
      return null;
    }
    if (current === 1) {
      return null;
    }
    if (current === 2) {
      if (initializingPayment) return "Initializing payment, please wait…";
      if (!clientSecret) return "Payment is not ready yet. Please wait a moment.";
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
    if (step < 4) setStep((s) => s + 1);
  }

  function handleBack() {
    setError(null);
    if (step > 0) setStep((s) => s - 1);
  }

  function handlePaymentSuccess(confirmationId: string) {
    const bookingId = confirmationId || `BK-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
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
  }

  const themeStyle: React.CSSProperties = {
    background:
      "linear-gradient(180deg, rgba(2,18,51,1) 0%, rgba(8,42,102,1) 35%, rgba(4,18,55,1) 100%)",
    ["--accent-yellow" as string]: "#FFD24D",
    ["--accent-yellow-600" as string]: "#FFC107",
    ["--muted-slate" as string]: "#94a3b8",
  };

  // UNIQUE keys for steps
  const stepLabels = [
    "Review",
    "Lead details",
    "Payment",
    "Review Booking",
    "Confirm"
  ];

  if (loading) return <div className="container mx-auto px-5 py-12 text-center text-slate-200">Loading booking details…</div>;

  if (!tour) {
    return (
      <main style={themeStyle} className="min-h-screen">
        <div className="container mx-auto px-5 py-12">
          <div className="max-w-2xl mx-auto card-glass p-6 rounded shadow text-center">
            <h2 className="text-xl font-semibold mb-2">Tour not found</h2>
            <p className="text-slate-300 mb-4">We couldn't find that tour. Go back to browse other routes.</p>
            <Link to="/routes" className="inline-block px-4 py-2 bg-rose-600 text-white rounded">Browse routes</Link>
          </div>
        </div>
      </main>
    );
  }

  const elementsAppearance = {
    theme: "night" as const,
    variables: {
      colorPrimary: "#ef4444",
      colorText: "#e6eefc",
      colorBackground: "#0f172a",
      colorTextSecondary: "#dbeafe",
      colorDanger: "#fb7185",
      borderRadius: "8px",
    },
    rules: {
      ".Input": {
        border: "1px solid rgba(255,255,255,0.16)",
      },
      ".Label": { color: "#dbeafe" },
    },
  };

  return (
    <main style={themeStyle} className="min-h-screen py-10">
      <style>{`
        .card-glass {
          background: linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.018));
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 18px 40px rgba(2, 6, 23, 0.6);
          color: #e6eefc;
        }
        .card-glass .text-xs,
        .card-glass .text-sm {
          font-size: 105% !important;
          line-height: 1.32;
          color: #dbeafe;
        }
        input, select, textarea {
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.16);
          color: #e6eefc;
        }
        input::placeholder, select::placeholder, textarea::placeholder {
          color: rgba(230,238,252,0.56);
        }
        input:focus, select:focus, textarea:focus {
          outline: none;
          box-shadow: 0 6px 24px rgba(2,6,23,0.55), 0 0 0 4px rgba(255,210,77,0.08);
          border-color: rgba(255,255,255,0.22);
        }
        .btn-primary {
          background: linear-gradient(180deg,#ef4444,#dc2626);
          color: white;
          border: none;
          box-shadow: 0 8px 24px rgba(220,38,38,0.18);
        }
        .btn-primary:hover { transform: translateY(-1px); }
        .btn-secondary {
          background: transparent;
          color: #e6eefc;
          border: 1px solid rgba(255,255,255,0.14);
        }
        .btn-accent { background: var(--accent-yellow); color: #12263a; }
        .price-highlight { color: #ff6b6b; font-weight: 700; }
        .step-dot { background: rgba(255,255,255,0.06); color: #e6eefc; }
        .step-dot.active {
          background: #ef4444; color: white;
          box-shadow: 0 6px 18px rgba(239,68,68,0.18);
        }
        .card-divider { border-top: 1px solid rgba(255,255,255,0.06); margin-top: 0.6rem; padding-top: 0.6rem; }
        a { color: var(--accent-yellow); }
      `}</style>

      <div className="container mx-auto px-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="card-glass rounded-lg p-4">
              <div className="flex items-center gap-4">
                {stepLabels.map((label, i) => (
                  <div key={label + i} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold step-dot ${i === step ? "active" : ""}`}
                      aria-current={i === step ? "step" : undefined}
                    >
                      {i + 1}
                    </div>
                    <div className={`hidden sm:block text-sm ${i === step ? "text-slate-100 font-semibold" : "text-slate-300"}`}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-glass rounded-lg p-6">
              {(step === 2 || step === 3 || step === 4) && clientSecret && !initializingPayment ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: elementsAppearance }}>
                  {/* Always mount PaymentElement for StripeConfirmSection */}
                  <div style={{ display: step === 2 ? "block" : "none" }}>
                    <PaymentElement options={{ layout: "tabs" }} />
                  </div>
                  {step === 2 && (
                    <section aria-labelledby="payment-heading">
                      <h2 id="payment-heading" className="text-lg font-semibold mb-3 text-slate-100">Payment</h2>
                      <div className="text-sm text-slate-300 mb-3">Enter your card details below. Test mode is enabled.</div>
                      {error && <div className="mt-3 text-rose-400">{error}</div>}
                      <div className="mt-6 flex justify-between items-center">
                        <button onClick={handleBack} className="px-4 py-2 btn-secondary rounded">Back</button>
                        <button
                          onClick={handleNext}
                          className="px-4 py-2 btn-primary rounded"
                          disabled={!clientSecret || initializingPayment}
                        >
                          Review booking
                        </button>
                      </div>
                    </section>
                  )}
                  {step === 3 && (
                    <section aria-labelledby="review-confirm-heading">
                      <h2 id="review-confirm-heading" className="text-lg font-semibold mb-3 text-slate-100">
                        Review your booking
                      </h2>
                      <div className="bg-white/6 border rounded p-4">
                        <div className="flex justify-between">
                          <div>
                            <div className="text-xs text-slate-300">Tour</div>
                            <div className="font-semibold text-slate-100">{tour.title}</div>
                            <div className="text-sm text-slate-300 mt-1">{tour.summary}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-slate-300">Date</div>
                            <div className="font-semibold text-slate-100">{selectedDate ? new Date(selectedDate).toDateString() : "—"}</div>
                            <div className="text-xs text-slate-300 mt-2">Passengers</div>
                            <div className="font-semibold text-slate-100">{passengers}</div>
                          </div>
                        </div>
                        <div className="card-divider">
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-slate-300">Per person</div>
                            <div className="font-semibold text-slate-100">{formatCurrencyPHP(perPerson)}</div>
                          </div>
                          <div className="mt-2 flex justify-between items-center">
                            <div className="text-sm text-slate-300">Total</div>
                            <div className="text-2xl font-bold price-highlight">{formatCurrencyPHP(total)}</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 flex justify-between items-center">
                        <button onClick={handleBack} className="px-4 py-2 btn-secondary rounded">Back</button>
                        <button
                          onClick={() => setStep(4)}
                          className="px-4 py-2 btn-primary rounded"
                        >
                          Confirm Booking & Pay
                        </button>
                      </div>
                    </section>
                  )}
                  {step === 4 && (
                    <>
                      {/* PaymentElement is still mounted (hidden) for Stripe! */}
                      <StripeConfirmSection
                        tour={tour}
                        slug={slug}
                        selectedDate={selectedDate}
                        passengers={passengers}
                        perPerson={perPerson}
                        total={total}
                        onBack={handleBack}
                        onSuccess={handlePaymentSuccess}
                      />
                    </>
                  )}
                </Elements>
              ) : (
                <>
                  {step === 0 && (
                    <section aria-labelledby="review-heading">
                      <h2 id="review-heading" className="text-lg font-semibold mb-3 text-slate-100">Review your selection</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-slate-300">Tour</div>
                          <div className="font-semibold text-slate-100">{tour.title}</div>
                          <div className="text-sm text-slate-300 mt-1">{tour.summary}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-300">Date</div>
                          <select value={selectedDate ?? ""} onChange={(e) => setSelectedDate(e.target.value)} className="mt-1 w-full rounded px-3 py-2">
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
                          <div className="text-xs text-slate-300 mt-3">Passengers</div>
                          <input type="number" min={1} value={passengers} onChange={(e) => setPassengers(Math.max(1, Number(e.target.value)))} className="mt-1 w-32 rounded px-3 py-2" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-300">Per person</div>
                        <div className="text-lg font-semibold text-slate-100">{formatCurrencyPHP(perPerson)}</div>
                      </div>
                      <div className="mt-6 flex justify-end gap-3">
                        <button onClick={() => navigate(-1)} className="px-4 py-2 btn-secondary rounded">Back</button>
                        <button onClick={handleNext} className="px-4 py-2 btn-primary rounded">Continue</button>
                      </div>
                    </section>
                  )}

                  {step === 1 && (
                    <section aria-labelledby="lead-heading">
                      <h2 id="lead-heading" className="text-lg font-semibold mb-3 text-slate-100">Lead passenger details</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input placeholder="Full name" className="rounded px-3 py-2" />
                        <input placeholder="Email address" type="email" className="rounded px-3 py-2" />
                        <input placeholder="Phone (optional)" className="rounded px-3 py-2" />
                        <input placeholder="Passport or ID" className="rounded px-3 py-2" />
                      </div>
                      <div className="mt-6 flex justify-between">
                        <button onClick={handleBack} className="px-4 py-2 btn-secondary rounded">Back</button>
                        <div className="flex gap-3">
                          <button onClick={() => { /* add resets if needed */ }} className="px-4 py-2 btn-secondary rounded">Reset</button>
                          <button onClick={handleNext} className="px-4 py-2 btn-primary rounded">Continue to payment</button>
                        </div>
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>
          </div>
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-24">
              <div className="card-glass rounded-lg p-5">
                <img src={tour.images?.[0] ?? "/assets/placeholder.jpg"} alt={tour.title} className="w-full h-40 object-cover rounded" />
                <div className="mt-4">
                  <div className="text-xs text-slate-300">Your booking</div>
                  <div className="text-lg font-semibold text-slate-100">{tour.title}</div>
                  <div className="text-sm text-slate-300 mt-1">{tour.line ?? ""} • {tour.durationDays ?? tour.itinerary?.length ?? 0} days</div>
                  <div className="mt-4 text-sm text-slate-300 space-y-2">
                    <div><strong className="text-slate-100">Date:</strong> <span className="ml-2">{selectedDate ? new Date(selectedDate).toDateString() : "—"}</span></div>
                    <div><strong className="text-slate-100">Passengers:</strong> <span className="ml-2">{passengers}</span></div>
                    <div><strong className="text-slate-100">Per head:</strong> <span className="ml-2 font-semibold">{formatCurrencyPHP(perPerson)}</span></div>
                    <div className="card-divider">
                      <div className="text-xs text-slate-300">Total</div>
                      <div className="text-2xl font-bold price-highlight">{formatCurrencyPHP(total)}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Link to={`/tour/${tour.slug}`} className="flex-1 px-3 py-2 btn-secondary rounded text-center">Back to tour</Link>
                    <button onClick={() => { setStep(3); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="px-3 py-2 btn-primary rounded">Proceed</button>
                  </div>
                </div>
              </div>
              <div className="mt-4 card-glass rounded p-4 text-sm text-slate-300">
                <div className="font-semibold mb-2 text-slate-100">Need help?</div>
                <div>Call reservations: <strong className="text-slate-100">+63 02 8526 8404</strong></div>
                <div className="mt-2">Email: <a href="mailto:reservations@example.com" className="text-accent-yellow underline">reservations@example.com</a></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function StripeConfirmSection(props: {
  tour: Tour;
  slug?: string;
  selectedDate: string | null;
  passengers: number;
  perPerson: number;
  total: number;
  onBack: () => void;
  onSuccess: (confirmationId: string) => void;
}) {
  const { selectedDate, passengers, perPerson, total, onBack, onSuccess, tour } = props;
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!stripe || !elements) {
      setError("Payment SDK not ready. Please wait a moment.");
      return;
    }

    try {
      setSubmitting(true);
      const result = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          payment_method_data: {
            billing_details: {},
          },
        },
      });

      if (result.error) {
        setError(result.error.message ?? "Payment failed. Please try again.");
        setSubmitting(false);
        return;
      }

      const pi = result.paymentIntent;
      if (pi && (pi.status === "succeeded" || pi.status === "processing" || pi.status === "requires_capture")) {
        onSuccess(pi.id);
      } else {
        setError("Unable to confirm payment. Please try another payment method.");
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setError("Payment failed. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="confirm-heading">
      <h2 id="confirm-heading" className="text-lg font-semibold mb-3 text-slate-100">Processing payment…</h2>
      <div className="bg-white/6 border rounded p-4">
        <div className="flex justify-between">
          <div>
            <div className="text-xs text-slate-300">Tour</div>
            <div className="font-semibold text-slate-100">{tour.title}</div>
            <div className="text-sm text-slate-300 mt-1">{tour.summary}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-300">Date</div>
            <div className="font-semibold text-slate-100">{selectedDate ? new Date(selectedDate).toDateString() : "—"}</div>
            <div className="text-xs text-slate-300 mt-2">Passengers</div>
            <div className="font-semibold text-slate-100">{passengers}</div>
          </div>
        </div>
        <div className="card-divider">
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-300">Per person</div>
            <div className="font-semibold text-slate-100">{formatCurrencyPHP(perPerson)}</div>
          </div>
          <div className="mt-2 flex justify-between items-center">
            <div className="text-sm text-slate-300">Total</div>
            <div className="text-2xl font-bold price-highlight">{formatCurrencyPHP(total)}</div>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mt-6 flex justify-between items-center">
          <button type="button" onClick={onBack} className="px-4 py-2 btn-secondary rounded">Back</button>
          <div className="flex items-center gap-3">
            {error && <div className="text-rose-400 mr-2">{error}</div>}
            <button type="submit" disabled={submitting || !stripe || !elements} className="px-4 py-2 btn-primary rounded">
              {submitting ? "Confirming…" : `Pay — ${formatCurrencyPHP(total)}`}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}