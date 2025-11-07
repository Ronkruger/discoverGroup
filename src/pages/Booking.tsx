import { useEffect, useState, type JSX } from "react";
import { Link, useNavigate, useParams, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import type { Tour } from "../types";
import { fetchTourBySlug } from "../api/tours";
// Payment Gateway Integration - Mockup for PayMongo & Dragonpay
import { PaymentGateway, PaymentMethodSelector } from "../lib/payment-gateway";
import type { PaymentMethod } from "../lib/payment-gateway";
import { PayMongoMockup, DragonpayMockup } from "../components/PaymentMockup";
import { createBooking } from "../api/bookings";
import React from "react";
import ProgressIndicator from "../components/ProgressIndicator";
import { TrustSignals, UrgencyIndicators, BookingProtection } from "../components/TrustSignals";

function formatCurrencyPHP(amount: number) {
  return `PHP ${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Define an extended type that includes the new fields from TourForm
type ExtendedTour = Tour & {
  regularPricePerPerson?: number;
  promoPricePerPerson?: number;
  basePricePerDay?: number;
  durationDays?: number;
  itinerary?: unknown[];
  isSaleEnabled?: boolean;
  saleEndDate?: string | null;
  allowsDownpayment?: boolean;
};

export default function Booking(): JSX.Element {
  const { user } = useAuth();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  const navState = (location.state ?? {}) as {
    tour?: ExtendedTour; // Use extended type
    selectedDate?: string;
    passengers?: number;
    perPerson?: number;
  } | undefined;
  const navigate = useNavigate();

  const [tour, setTour] = useState<ExtendedTour | null>(() => navState?.tour ?? null);
  const [loading, setLoading] = useState<boolean>(tour === null);
  const [selectedDate, setSelectedDate] = useState<string | null>(() => navState?.selectedDate ?? null);
  const [passengers, setPassengers] = useState<number>(() => navState?.passengers ?? 1);
  const [perPerson, setPerPerson] = useState<number>(() => navState?.perPerson ?? 0);

  // Booking flow state
  const [step, setStep] = useState<number>(0); // 0: review, 1: lead, 2: payment, 3: review, 4: confirm/pay
  const [error, setError] = useState<string | null>(null);

  // Customer information state
  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerPassport, setCustomerPassport] = useState<string>("");

  // Office appointment state
  const [wantsAppointment, setWantsAppointment] = useState<boolean>(false);
  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [appointmentTime, setAppointmentTime] = useState<string>("");
  const [appointmentPurpose, setAppointmentPurpose] = useState<string>("consultation");

  // Payment options state
  const [paymentType, setPaymentType] = useState<"full" | "downpayment" | "cash-appointment">("full");
  const [downpaymentPercentage, setDownpaymentPercentage] = useState<number>(30); // 30% default
  const [customPaymentTerms, setCustomPaymentTerms] = useState<string>("30"); // "30", "50", "70", or custom

  // Payment Gateway state (PayMongo & Dragonpay)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);

  // Auto-check appointment if cash-appointment payment is selected
  useEffect(() => {
    if (paymentType === "cash-appointment" && !wantsAppointment) {
      setWantsAppointment(true);
    }
  }, [paymentType, wantsAppointment]);

  // Reset to default payment terms when switching away from downpayment
  useEffect(() => {
    if (paymentType !== "downpayment") {
      setCustomPaymentTerms("30");
      setDownpaymentPercentage(30);
    }
  }, [paymentType]);

  /**
   * Helper to calculate the correct price per person,
   * respecting the isSaleEnabled and saleEndDate fields.
   */
  const getEffectivePrice = (tourData: ExtendedTour): number => {
    const anyT = tourData as ExtendedTour;

    const saleDate = anyT.saleEndDate ? new Date(anyT.saleEndDate) : null;
    const isSaleActive = anyT.isSaleEnabled &&
                         typeof anyT.promoPricePerPerson === 'number' &&
                         (!saleDate || saleDate > new Date()); // Sale is on if no end date or end date is in the future

    const regular = typeof anyT.regularPricePerPerson === "number" ? anyT.regularPricePerPerson : undefined;
    const promo = typeof anyT.promoPricePerPerson === "number" ? anyT.promoPricePerPerson : undefined;
    const days = anyT.durationDays ?? (anyT.itinerary?.length ?? 0);
    const computed = Math.round((anyT.basePricePerDay ?? 0) * days);

    if (isSaleActive && promo !== undefined) {
      return promo;
    } else if (regular !== undefined) {
      return regular;
    } else if (promo !== undefined) { // Fallback to promo if regular is missing, even if sale is "off"
      return promo;
    } else {
      return computed; // Last resort
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // If tour data is passed via state, use it
      if (tour) {
        // But if perPerson price wasn't passed, calculate it
        if (!perPerson) {
          setPerPerson(getEffectivePrice(tour));
        }
        setLoading(false);
        return;
      }

      // If no tour data and no slug, we can't do anything
      if (!slug) {
        setLoading(false);
        return;
      }

      // Fetch tour data by slug
      setLoading(true);
      try {
        const fetched = (await fetchTourBySlug(slug)) as ExtendedTour;
        if (!cancelled) {
          setTour(fetched);
          // If tour was fetched, calculate price if not passed in state
          if (fetched && !perPerson) {
            setPerPerson(getEffectivePrice(fetched));
          }
          // Set other details from navState if they exist
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
  }, [navState?.passengers, navState?.selectedDate, perPerson, slug, tour]); // Dependencies remain the same

  const total = (perPerson ?? 0) * Math.max(1, passengers);
  
  // Calculate payment amounts based on payment type with safety checks
  const safePercentage = Math.max(10, Math.min(90, downpaymentPercentage)); // Clamp between 10-90%
  const downpaymentAmount = Math.round(total * (safePercentage / 100));
  const remainingBalance = Math.max(0, total - downpaymentAmount); // Ensure non-negative
  const paymentAmount = paymentType === "cash-appointment" ? 0 : paymentType === "downpayment" ? downpaymentAmount : total;
  
  // Validate payment amounts
  if (total < 0 || isNaN(total)) {
    console.error('Invalid total amount:', total);
  }
  if (paymentType === "downpayment" && (downpaymentAmount <= 0 || downpaymentAmount >= total)) {
    console.warn('Invalid downpayment amount:', downpaymentAmount, 'Total:', total);
  }

  function validateStep(current: number): string | null {
    if (current === 0) {
      if (!selectedDate) return "Please choose a travel date before continuing.";
      if (!passengers || passengers < 1) return "Please enter number of passengers.";
      if (!paymentType) return "Please select a payment option before continuing.";
      if (paymentType === "downpayment" && (downpaymentPercentage < 10 || downpaymentPercentage > 90)) {
        return "Downpayment percentage must be between 10% and 90%.";
      }
      // Allow proceeding to next step - appointment will be validated in step 2
      return null;
    }
    if (current === 1) {
      return null;
    }
    if (current === 2) {
      // Appointment step - validate if user wants appointment OR if cash payment is selected
      if (paymentType === "cash-appointment" && !wantsAppointment) {
        return "Please schedule an appointment to pay cash on hand at our office.";
      }
      if (wantsAppointment && !appointmentDate) return "Please select an appointment date.";
      if (wantsAppointment && !appointmentTime) return "Please select an appointment time.";
      if (paymentType === "cash-appointment" && !appointmentDate) return "Please select an appointment date for cash payment.";
      if (paymentType === "cash-appointment" && !appointmentTime) return "Please select an appointment time for cash payment.";
      return null;
    }
    if (current === 3) {
      // Payment step - Skip validation if cash-appointment is selected
      if (paymentType === "cash-appointment") {
        return null; // No online payment needed
      }
      // Payment method must be selected for online payment
      if (!selectedPaymentMethod) {
        return "Please select a payment method to continue.";
      }
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
    
    // Skip step 3 (payment) if cash-appointment is selected
    if (step === 2 && paymentType === "cash-appointment") {
      setStep(4); // Jump directly to review (step 4)
    } else if (step < 5) {
      setStep((s) => s + 1);
    }
  }

  function handleBack() {
    setError(null);
    // Skip step 3 (payment) when going back if cash-appointment is selected
    if (step === 4 && paymentType === "cash-appointment") {
      setStep(2); // Jump back to appointment (step 2)
    } else if (step > 0) {
      setStep((s) => s - 1);
    }
  }

  function handlePaymentSuccess(confirmationId: string) {
    const bookingId = confirmationId || `BK-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
    
    console.log('🎉 Payment successful! Booking details:', {
      bookingId,
      customerName,
      customerEmail,
      tourTitle: tour?.title
    });

    // Save booking to our database/storage
    if (tour && customerName && customerEmail && selectedDate) {
      console.log('🔄 Attempting to save booking to MongoDB...');
      console.log('📋 Booking data:', {
        tourSlug: tour.slug,
        customerName,
        customerEmail,
        selectedDate,
        passengers,
        perPerson,
        total,
        paymentType,
        paymentIntentId: confirmationId
      });
      
      createBooking({
        tour,
        customerName,
        customerEmail,
        customerPhone,
        customerPassport,
        selectedDate,
        passengers,
        perPerson,
        paymentType,
        paymentIntentId: confirmationId,
        // Include appointment details if user requested one
        ...(wantsAppointment && {
          appointmentDate,
          appointmentTime,
          appointmentPurpose,
        }),
      }).then((savedBooking) => {
        console.log('✅ Booking saved successfully to MongoDB:', savedBooking.bookingId);
        console.log('💾 Saved booking details:', savedBooking);
      }).catch((error) => {
        console.error('❌ Failed to save booking to MongoDB:', error);
        console.error('🔍 Error details:', error.message);
        // Still continue with navigation even if save fails
      });
    } else {
      console.warn('⚠️ Cannot save booking - missing required data:', {
        hasTour: !!tour,
        hasCustomerName: !!customerName,
        hasCustomerEmail: !!customerEmail,
        hasSelectedDate: !!selectedDate
      });
    }
    
    // Navigate immediately - don't wait for email
    // Use both URL parameter and state for better reliability
    navigate(`/booking/confirmation/${bookingId}`, {
      state: {
        bookingId,
        tourTitle: tour?.title ?? slug,
        country: tour?.additionalInfo?.countriesVisited?.[0] ?? "",
        date: selectedDate,
        passengers,
        perPerson,
        total,
        customerEmail: customerEmail || undefined,
        appointmentDate: wantsAppointment ? appointmentDate : undefined,
        appointmentTime: wantsAppointment ? appointmentTime : undefined,
        appointmentPurpose: wantsAppointment ? appointmentPurpose : undefined,
      },
    });
    
    // Send confirmation email via backend API (non-blocking)
    if (customerName && customerEmail && tour) {
      console.log('📧 Sending confirmation email to:', customerEmail);
      
      // Fire and forget - don't block the UI
      setTimeout(async () => {
        try {
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
          const response = await fetch(`${API_BASE_URL}/api/send-booking-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bookingId,
              customerName,
              customerEmail,
              tourTitle: tour.title,
              tourDate: selectedDate || '',
              passengers,
              pricePerPerson: perPerson,
              totalAmount: total,
              downpaymentAmount: paymentType === "downpayment" ? downpaymentAmount : undefined,
              remainingBalance: paymentType === "downpayment" ? remainingBalance : undefined,
              isDownpaymentOnly: paymentType === "downpayment",
              country: tour.additionalInfo?.countriesVisited?.[0] || '',
              // Include appointment details if scheduled
              ...(wantsAppointment && {
                appointmentDate,
                appointmentTime,
                appointmentPurpose,
              }),
            }),
          });

          const result = await response.json();

          if (result.success) {
            console.log('✅ Booking confirmation email sent successfully via backend API');
            console.log('✅ Message ID:', result.messageId);
          } else {
            console.error('❌ Backend API email sending failed:', result.error);
          }
        } catch (error) {
          console.error('❌ Failed to send email via backend API:', error);
        }
      }, 100); // Small delay to ensure navigation happens first
    } else {
      console.warn('⚠️ Email not sent - missing customer details:', {
        hasCustomerName: !!customerName,
        hasCustomerEmail: !!customerEmail,
        hasTour: !!tour
      });
    }
  }

  const themeStyle: React.CSSProperties = {
    background:
      "linear-gradient(180deg, rgba(2,18,51,1) 0%, rgba(8,42,102,1) 35%, rgba(4,18,55,1) 100%)",
    ["--accent-yellow" as string]: "#FFD24D",
    ["--accent-yellow-600" as string]: "#FFC107",
    ["--muted-slate" as string]: "#94a3b8",
  };

  // Define the booking steps for progress indicator
  const bookingSteps = [
    { id: 1, title: "Review", description: "Tour details" },
    { id: 2, title: "Details", description: "Your information" },
    { id: 3, title: "Appointment", description: "Office visit (optional)" },
    { id: 4, title: "Payment", description: "Secure checkout" },
    { id: 5, title: "Review", description: "Final check" },
    { id: 6, title: "Confirm", description: "Complete booking" }
  ];

  // (stepLabels removed — it was unused)

  if (loading) return <div className="container mx-auto px-5 py-12 text-center text-slate-200">Loading booking details…</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!tour) {
    return (
      <main style={themeStyle} className="min-h-screen">
        <div className="container mx-auto px-5 py-12">
          <div className="text-center text-slate-200">
            <p className="text-slate-300 mb-4">We couldn't find that tour. Go back to browse other routes.</p>
            <Link to="/routes" className="inline-block px-4 py-2 bg-rose-600 text-white rounded">Browse routes</Link>
          </div>
        </div>
      </main>
    );
  }

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
              <ProgressIndicator 
                steps={bookingSteps}
                currentStep={step + 1}
                className="mb-2"
              />
            </div>
            <div className="card-glass rounded-lg p-6">
              {/* Step 3: Payment Method Selection */}
              {step === 3 && paymentType !== "cash-appointment" && (
                <section aria-labelledby="payment-heading">
                  <h2 id="payment-heading" className="text-lg font-semibold mb-3 text-slate-100">Select Payment Method</h2>
                  
                  {/* Trust signals before payment form */}
                  <div className="mb-6">
                    <TrustSignals />
                    <div className="mt-4">
                      <UrgencyIndicators />
                    </div>
                    <div className="mt-4">
                      <BookingProtection />
                    </div>
                  </div>
                  
                  <PaymentMethodSelector 
                    onSelect={(method) => {
                      setSelectedPaymentMethod(method);
                      setSelectedGateway(method.gateway);
                    }}
                    selectedMethod={selectedPaymentMethod || undefined}
                  />
                  
                  {error && <div className="mt-3 text-rose-400">{error}</div>}
                  <div className="mt-6 flex justify-between items-center">
                    <button onClick={handleBack} className="px-4 py-2 btn-secondary rounded">Back</button>
                    <button
                      onClick={handleNext}
                      className="px-4 py-2 btn-primary rounded"
                      disabled={!selectedPaymentMethod}
                    >
                      Review booking
                    </button>
                  </div>
                </section>
              )}

              {/* Step 4: Review Booking */}
              {step === 4 && (
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
                        <div className="text-xs text-slate-300">Departure Date</div>
                        <div className="font-semibold text-slate-100">{selectedDate || "—"}</div>
                        <div className="text-xs text-slate-300 mt-2">Passengers</div>
                        <div className="font-semibold text-slate-100">{passengers}</div>
                      </div>
                    </div>
                    {wantsAppointment && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="text-xs text-slate-300 mb-2">Office Appointment</div>
                        <div className="flex items-center gap-2 text-sm text-slate-100">
                          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{new Date(appointmentDate).toLocaleDateString()} at {appointmentTime}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">Purpose: {appointmentPurpose.replace('-', ' ')}</div>
                      </div>
                    )}
                    {selectedPaymentMethod && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="text-xs text-slate-300 mb-2">Payment Method</div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{selectedPaymentMethod.icon}</span>
                          <div>
                            <div className="font-semibold text-slate-100">{selectedPaymentMethod.name}</div>
                            <div className="text-xs text-slate-400">{selectedPaymentMethod.description}</div>
                          </div>
                        </div>
                      </div>
                    )}
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
                      onClick={() => setStep(5)}
                      className="px-4 py-2 btn-primary rounded"
                    >
                      Proceed to Payment
                    </button>
                  </div>
                </section>
              )}

              {/* Step 5: Payment Gateway Mockup */}
              {step === 5 && selectedPaymentMethod && (
                <section aria-labelledby="confirm-heading">
                  <h2 id="confirm-heading" className="text-lg font-semibold mb-3 text-slate-100">Complete Payment</h2>
                  
                  {selectedGateway === PaymentGateway.PAYMONGO && (
                    <PayMongoMockup 
                      amount={total}
                      paymentMethod={selectedPaymentMethod}
                      onComplete={() => {
                        const paymentId = `pm_${selectedPaymentMethod.type}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
                        console.log('✅ PayMongo mockup payment completed:', paymentId);
                        handlePaymentSuccess(paymentId);
                      }}
                      onBack={handleBack}
                    />
                  )}
                  
                  {selectedGateway === PaymentGateway.DRAGONPAY && (
                    <DragonpayMockup 
                      amount={total}
                      paymentMethod={selectedPaymentMethod}
                      onComplete={() => {
                        const paymentId = `dp_${selectedPaymentMethod.type}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
                        console.log('✅ Dragonpay mockup payment completed:', paymentId);
                        handlePaymentSuccess(paymentId);
                      }}
                      onBack={handleBack}
                    />
                  )}
                </section>
              )}
              
              {/* Regular booking steps for early steps or cash payment */}
              {(step < 3 || paymentType === "cash-appointment") && (
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
                          <div className="text-xs text-slate-300">Travel Date</div>
                          <select 
                            value={selectedDate ?? ""} 
                            onChange={(e) => setSelectedDate(e.target.value)} 
                            className="mt-1 w-full rounded px-3 py-2 bg-white/10 border border-white/20 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                          >
                            <option value="" className="bg-slate-800 text-slate-300">Select departure date</option>
                            {tour.departureDates && tour.departureDates.length > 0 ? (
                              tour.departureDates.map((dateRange, index) => {
                                const value =
                                  typeof dateRange === "string"
                                    ? dateRange
                                    : `${dateRange.start} - ${dateRange.end}`;
                                const label =
                                  typeof dateRange === "string"
                                    ? dateRange
                                    : `${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`;
                                return (
                                  <option key={index} value={value} className="bg-slate-800 text-white">
                                    {label}
                                  </option>
                                );
                              })
                            ) : tour.travelWindow ? (
                              <option value={`${tour.travelWindow.start} - ${tour.travelWindow.end}`} className="bg-slate-800 text-white">
                                {`${new Date(tour.travelWindow.start).toLocaleDateString()} - ${new Date(tour.travelWindow.end).toLocaleDateString()}`}
                              </option>
                            ) : (
                              <option value="" disabled className="bg-slate-800 text-slate-400">No departure dates available</option>
                            )}
                          </select>
                          {!selectedDate && (
                            <div className="text-xs text-red-400 mt-1">Please select a departure date to continue</div>
                          )}
                          <div className="text-xs text-slate-300 mt-3">Passengers</div>
                          <input type="number" min={1} value={passengers} onChange={(e) => setPassengers(Math.max(1, Number(e.target.value)))} className="mt-1 w-32 rounded px-3 py-2" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-300">Per person</div>
                        <div className="text-lg font-semibold text-slate-100">{formatCurrencyPHP(perPerson)}</div>
                      </div>
                      
                      {/* Payment Options */}
                      <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
                        <h3 className="text-md font-semibold mb-3 text-slate-100">Payment Options</h3>
                        <div className="space-y-3">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="paymentType"
                              value="full"
                              checked={paymentType === "full"}
                              onChange={(e) => setPaymentType(e.target.value as "full" | "downpayment" | "cash-appointment")}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="text-slate-100 font-medium">Full Payment (Online)</div>
                              <div className="text-sm text-slate-300">
                                Pay the complete amount now: {formatCurrencyPHP(total)}
                              </div>
                            </div>
                          </label>
                          
                          {tour.allowsDownpayment && (
                            <div className="space-y-3">
                              <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name="paymentType"
                                  value="downpayment"
                                  checked={paymentType === "downpayment"}
                                  onChange={(e) => {
                                    setPaymentType(e.target.value as "full" | "downpayment" | "cash-appointment");
                                  }}
                                  className="text-blue-600 focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                  <div className="text-slate-100 font-medium">Downpayment (Online Payment)</div>
                                  <div className="text-sm text-slate-300">
                                    Pay partial amount now, remaining before departure
                                  </div>
                                </div>
                              </label>
                              
                              {paymentType === "downpayment" && (
                                <div className="ml-8 p-4 bg-slate-900/50 rounded-lg space-y-4">
                                  <div>
                                    <label className="block text-slate-300 text-sm mb-2">Select Payment Terms</label>
                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                      {[
                                        { value: "30", label: "30%" },
                                        { value: "50", label: "50%" },
                                        { value: "70", label: "70%" }
                                      ].map((term) => (
                                        <button
                                          key={term.value}
                                          type="button"
                                          onClick={() => {
                                            setCustomPaymentTerms(term.value);
                                            setDownpaymentPercentage(Number(term.value));
                                          }}
                                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            customPaymentTerms === term.value
                                              ? 'bg-blue-500 text-white'
                                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                          }`}
                                        >
                                          {term.label}
                                        </button>
                                      ))}
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <label className="text-slate-300 text-sm">Custom:</label>
                                      <input
                                        type="number"
                                        min="10"
                                        max="90"
                                        value={customPaymentTerms === "30" || customPaymentTerms === "50" || customPaymentTerms === "70" ? "" : customPaymentTerms}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          if (value === "" || (Number(value) >= 10 && Number(value) <= 90)) {
                                            setCustomPaymentTerms(value);
                                            if (value !== "") {
                                              setDownpaymentPercentage(Number(value));
                                            }
                                          }
                                        }}
                                        placeholder="10-90"
                                        className="w-20 rounded px-3 py-2 bg-white/10 border border-white/20 text-white text-sm"
                                      />
                                      <span className="text-slate-400 text-sm">%</span>
                                    </div>
                                  </div>
                                  
                                  <div className="pt-3 border-t border-slate-700 space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-slate-300">Total Amount:</span>
                                      <span className="text-slate-100 font-semibold">{formatCurrencyPHP(total)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-slate-300">Downpayment ({downpaymentPercentage}%):</span>
                                      <span className="text-blue-400 font-semibold">{formatCurrencyPHP(downpaymentAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-slate-300">Remaining Balance:</span>
                                      <span className="text-yellow-400 font-semibold">{formatCurrencyPHP(remainingBalance)}</span>
                                    </div>
                                    <div className="text-xs text-slate-400 mt-2 flex items-start gap-1">
                                      <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span>Remaining balance must be paid at least 7 days before departure</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="paymentType"
                              value="cash-appointment"
                              checked={paymentType === "cash-appointment"}
                              onChange={(e) => setPaymentType(e.target.value as "full" | "downpayment" | "cash-appointment")}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="text-slate-100 font-medium">Cash on Hand (During Office Appointment)</div>
                              <div className="text-sm text-slate-300">
                                Pay in person at our office: {formatCurrencyPHP(total)}
                              </div>
                              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Requires scheduling an office appointment
                              </div>
                            </div>
                          </label>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-slate-700">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-slate-300">
                              {paymentType === "cash-appointment" ? "To Pay at Office" : paymentType === "full" ? "Total Amount" : "Amount to Pay Now"}
                            </div>
                            <div className="text-lg font-bold text-blue-400">
                              {formatCurrencyPHP(paymentType === "cash-appointment" ? total : paymentAmount)}
                            </div>
                          </div>
                          {paymentType === "cash-appointment" && (
                            <div className="mt-2 text-xs text-yellow-400 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              No online payment required - pay when you visit our office
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {error && <div className="mt-4 text-rose-400 font-medium">{error}</div>}
                      
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
                        <input 
                          placeholder="Full name" 
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="rounded px-3 py-2" 
                          required
                        />
                        <input 
                          placeholder="Email address" 
                          type="email" 
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="rounded px-3 py-2" 
                          required
                        />
                        <input 
                          placeholder="Phone (optional)" 
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="rounded px-3 py-2" 
                        />
                        <input 
                          placeholder="Passport or ID" 
                          value={customerPassport}
                          onChange={(e) => setCustomerPassport(e.target.value)}
                          className="rounded px-3 py-2" 
                        />
                      </div>
                      <div className="mt-6 flex justify-between">
                        <button onClick={handleBack} className="px-4 py-2 btn-secondary rounded">Back</button>
                        <div className="flex gap-3">
                          <button onClick={() => { 
                            setCustomerName("");
                            setCustomerEmail("");
                            setCustomerPhone("");
                            setCustomerPassport("");
                          }} className="px-4 py-2 btn-secondary rounded">Reset</button>
                          <button 
                            onClick={handleNext} 
                            disabled={!customerName.trim() || !customerEmail.trim()}
                            className="px-4 py-2 btn-primary rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    </section>
                  )}

                  {step === 2 && (
                    <section aria-labelledby="appointment-heading">
                      <div className="mb-6">
                        <h2 id="appointment-heading" className="text-lg font-semibold mb-2 text-slate-100">
                          Schedule an Office Visit
                        </h2>
                        <p className="text-slate-300 text-sm">
                          {paymentType === "cash-appointment" 
                            ? "You selected 'Cash on Hand' payment. Please schedule your office visit below to complete your payment."
                            : "Would you like to visit our office for a consultation? This is optional."}
                        </p>
                      </div>
                      
                      {paymentType === "cash-appointment" && (
                        <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                              <div className="text-yellow-200 font-semibold mb-1">Cash Payment Required</div>
                              <div className="text-yellow-100 text-sm">
                                Please bring <strong className="font-bold">{formatCurrencyPHP(total)}</strong> cash to your scheduled appointment. 
                                Our office accepts Philippine Peso only. Credit/debit cards are also available at the office.
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Office Information Card */}
                      <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-5 mb-6">
                        <div className="flex items-start gap-4">
                          <div className="bg-blue-500/20 rounded-lg p-3">
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold mb-2">Discover Group Office</h3>
                            <div className="space-y-1 text-sm text-slate-300">
                              <p className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                22nd floor, The Upper Class Tower, on the corner of Quezon Avenue and Sct. Reyes St. in Diliman, Quezon City
                              </p>
                              <p className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                +63 02 8526 8404
                              </p>
                              <p className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Mon-Fri: 9:00 AM - 6:00 PM | Sat: 10:00 AM - 4:00 PM
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Appointment Toggle */}
                      {paymentType !== "cash-appointment" && (
                        <div className="bg-white/5 border border-white/10 rounded-lg p-5 mb-6">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={wantsAppointment}
                              onChange={(e) => setWantsAppointment(e.target.checked)}
                              className="w-5 h-5 rounded border-2 border-white/20 bg-white/5 checked:bg-blue-500 checked:border-blue-500 cursor-pointer"
                            />
                            <div className="flex-1">
                              <div className="text-white font-medium">Yes, I'd like to schedule an office visit</div>
                              <div className="text-slate-400 text-sm mt-1">
                                Meet with our travel experts for personalized consultation
                              </div>
                            </div>
                          </label>
                        </div>
                      )}

                      {/* Appointment Details (shown when checkbox is checked OR cash-appointment is selected) */}
                      {(wantsAppointment || paymentType === "cash-appointment") && (
                        <div className="space-y-4 mb-6 p-5 bg-white/5 border border-white/10 rounded-lg">
                          <h3 className="text-white font-semibold mb-3">
                            {paymentType === "cash-appointment" ? "Schedule Your Payment Appointment" : "Select Your Preferred Date & Time"}
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-slate-300 text-sm mb-2">Appointment Date</label>
                              <input
                                type="date"
                                value={appointmentDate}
                                onChange={(e) => setAppointmentDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full rounded px-3 py-2 bg-white/10 border border-white/20 text-white"
                                required
                              />
                            </div>
                            
                            <div>
                              <label className="block text-slate-300 text-sm mb-2">Preferred Time</label>
                              <select
                                value={appointmentTime}
                                onChange={(e) => setAppointmentTime(e.target.value)}
                                className="w-full rounded px-3 py-2 bg-white/10 border border-white/20 text-white"
                                required
                              >
                                <option value="">Select a time</option>
                
                                <option value="10:00">10:00 AM</option>
                                <option value="11:00">11:00 AM</option>
                                <option value="13:00">1:00 PM</option>
                                <option value="14:00">2:00 PM</option>
                                <option value="15:00">3:00 PM</option>
                                <option value="16:00">4:00 PM</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-slate-300 text-sm mb-2">Purpose of Visit</label>
                            <select
                              value={appointmentPurpose}
                              onChange={(e) => setAppointmentPurpose(e.target.value)}
                              className="w-full rounded px-3 py-2 bg-white/10 border border-white/20 text-white"
                            >
                              <option value="consultation">General Consultation</option>
                              <option value="tour-details">Discuss Tour Details</option>
                              <option value="payment">Payment & Documentation</option>
                              <option value="customization">Customize Itinerary</option>
                              <option value="group-booking">Group Booking</option>
                            </select>
                          </div>

                          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 mt-4">
                            <div className="flex gap-3">
                              <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <div className="text-sm text-yellow-200">
                                <strong className="font-semibold">Note:</strong> Your appointment will be confirmed within 24 hours via email or phone. Please ensure your contact information is correct.
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Benefits of Office Visit */}
                      {!wantsAppointment && (
                        <div className="bg-white/5 border border-white/10 rounded-lg p-5 mb-6">
                          <h3 className="text-white font-semibold mb-3">Benefits of an Office Visit:</h3>
                          <ul className="space-y-2 text-slate-300 text-sm">
                            <li className="flex items-start gap-2">
                              <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Face-to-face consultation with travel experts</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>View photo albums and videos of destinations</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Discuss customization options for your tour</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Get special deals and exclusive offers</span>
                            </li>
                          </ul>
                        </div>
                      )}

                      <div className="mt-6 flex justify-between">
                        <button onClick={handleBack} className="px-4 py-2 btn-secondary rounded">Back</button>
                        <button 
                          onClick={handleNext}
                          disabled={wantsAppointment && (!appointmentDate || !appointmentTime)}
                          className="px-4 py-2 btn-primary rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {paymentType === "cash-appointment" ? "Continue to Review" : "Continue to Payment"}
                        </button>
                      </div>
                    </section>
                  )}

                  {/* Step 3: Skip for cash-appointment (no online payment needed) - automatically proceed */}
                  
                  {/* Step 4: Review Booking (for cash-appointment) */}
                  {step === 4 && paymentType === "cash-appointment" && (
                    <section aria-labelledby="review-confirm-heading">
                      <h2 id="review-confirm-heading" className="text-lg font-semibold mb-3 text-slate-100">
                        Review & Confirm Your Booking
                      </h2>
                      
                      <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6 space-y-4">
                        <div className="pb-4 border-b border-white/10">
                          <h3 className="text-white font-semibold mb-2">Tour Details</h3>
                          <div className="text-slate-300 text-sm space-y-1">
                            <div><strong className="text-slate-100">Tour:</strong> {tour.title}</div>
                            <div><strong className="text-slate-100">Departure:</strong> {(() => {
                              if (!selectedDate) return "—";
                              
                              // Handle date ranges (e.g., "2025-05-13 - 2025-05-27")
                              if (selectedDate.includes(' - ')) {
                                const [startDate, endDate] = selectedDate.split(' - ').map(d => d.trim());
                                const start = new Date(startDate);
                                const end = new Date(endDate);
                                
                                if (isNaN(start.getTime()) || isNaN(end.getTime())) return "—";
                                
                                return `${start.toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric'
                                })} - ${end.toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}`;
                              }
                              
                              // Handle single dates
                              const date = new Date(selectedDate);
                              return isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
                            })()}</div>
                            <div><strong className="text-slate-100">Passengers:</strong> {passengers}</div>
                          </div>
                        </div>

                        {wantsAppointment && appointmentDate && (
                          <div className="pb-4 border-b border-white/10">
                            <h3 className="text-white font-semibold mb-2">Office Appointment</h3>
                            <div className="text-slate-300 text-sm space-y-1">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span><strong className="text-slate-100">Date:</strong> {new Date(appointmentDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span><strong className="text-slate-100">Time:</strong> {appointmentTime}</span>
                              </div>
                              <div><strong className="text-slate-100">Purpose:</strong> {appointmentPurpose.replace('-', ' ')}</div>
                            </div>
                          </div>
                        )}

                        <div className="pb-4 border-b border-white/10">
                          <h3 className="text-white font-semibold mb-2">Contact Information</h3>
                          <div className="text-slate-300 text-sm space-y-1">
                            <div><strong className="text-slate-100">Name:</strong> {customerName || "—"}</div>
                            <div><strong className="text-slate-100">Email:</strong> {customerEmail || "—"}</div>
                            <div><strong className="text-slate-100">Phone:</strong> {customerPhone || "—"}</div>
                          </div>
                        </div>

                        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                              <div className="text-yellow-200 font-semibold mb-1">Payment Method: Cash on Hand</div>
                              <div className="text-yellow-100 text-sm">
                                Total Amount Due: <strong className="font-bold">{formatCurrencyPHP(total)}</strong>
                              </div>
                              <div className="text-yellow-100 text-sm mt-1">
                                Please bring cash to your scheduled appointment at our office. Credit/debit cards are also accepted.
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-300">Per person:</span>
                            <span className="text-slate-100 font-semibold">{formatCurrencyPHP(perPerson)}</span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-white font-semibold">Total Amount:</span>
                            <span className="text-2xl font-bold text-blue-400">{formatCurrencyPHP(total)}</span>
                          </div>
                        </div>
                      </div>

                      {error && <div className="mt-3 text-rose-400">{error}</div>}
                      
                      <div className="mt-6 flex justify-between">
                        <button onClick={handleBack} className="px-4 py-2 btn-secondary rounded">Back</button>
                        <button 
                          onClick={handleNext}
                          className="px-4 py-2 btn-primary rounded"
                        >
                          Confirm Booking
                        </button>
                      </div>
                    </section>
                  )}

                  {/* Step 5: Confirmation (for cash-appointment) */}
                  {step === 5 && paymentType === "cash-appointment" && (
                    <section aria-labelledby="final-confirm-heading">
                      <h2 id="final-confirm-heading" className="text-lg font-semibold mb-3 text-slate-100">
                        Complete Your Booking
                      </h2>
                      
                      <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 border border-green-700/50 rounded-lg p-6 mb-6">
                        <div className="flex items-start gap-4">
                          <div className="bg-green-500/20 rounded-full p-3">
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-bold text-lg mb-2">You're Almost Done!</h3>
                            <p className="text-slate-300 text-sm">
                              Click "Complete Booking" below to finalize your reservation. You will receive a confirmation email with your appointment details.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
                        <h3 className="text-white font-semibold mb-3">What happens next?</h3>
                        <ol className="space-y-3 text-slate-300 text-sm">
                          <li className="flex items-start gap-3">
                            <span className="bg-blue-500/20 text-blue-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold">1</span>
                            <span>You'll receive a confirmation email with your booking ID and appointment details</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="bg-blue-500/20 text-blue-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold">2</span>
                            <span>Our team will confirm your appointment within 24 hours</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="bg-blue-500/20 text-blue-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold">3</span>
                            <span>Visit our office on <strong>{appointmentDate ? new Date(appointmentDate).toLocaleDateString() : 'your scheduled date'}</strong> at <strong>{appointmentTime}</strong></span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="bg-blue-500/20 text-blue-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold">4</span>
                            <span>Bring <strong className="text-white">{formatCurrencyPHP(total)}</strong> cash (or use credit/debit card at office)</span>
                          </li>
                        </ol>
                      </div>

                      {error && <div className="mt-3 text-rose-400">{error}</div>}
                      
                      <div className="mt-6 flex justify-between">
                        <button onClick={handleBack} className="px-4 py-2 btn-secondary rounded">Back</button>
                        <button 
                          onClick={() => {
                            // Generate booking ID and complete the booking
                            const bookingId = `BK-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
                            handlePaymentSuccess(bookingId);
                          }}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded transition-colors"
                        >
                          Complete Booking
                        </button>
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
                    <div><strong className="text-slate-100">Departure:</strong> <span className="ml-2">
                      {(() => {
                        if (!selectedDate) return "—";
                        
                        // Handle date ranges (e.g., "2025-05-13 - 2025-05-27")
                        if (selectedDate.includes(' - ')) {
                          const [startDate, endDate] = selectedDate.split(' - ').map(d => d.trim());
                          const start = new Date(startDate);
                          const end = new Date(endDate);
                          
                          if (isNaN(start.getTime()) || isNaN(end.getTime())) return "—";
                          
                          return `${start.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          })} - ${end.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}`;
                        }
                        
                        // Handle single dates
                        const date = new Date(selectedDate);
                        if (isNaN(date.getTime())) return "—";
                        
                        return date.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        });
                      })()}
                    </span></div>
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