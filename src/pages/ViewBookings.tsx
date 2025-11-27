import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import type { Booking, BookingStatus } from "../types";
import { fetchAllBookings, updateBookingStatus, deleteBooking } from "../api/bookings";
import Loading from "../components/Loading";
import React from "react";

function formatCurrencyPHP(amount: number) {
  return `PHP ${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadgeColor(status: BookingStatus): string {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    case "completed":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const getIcon = () => {
    switch (status) {
      case "confirmed":
        return "✓";
      case "pending":
        return "⏳";
      case "cancelled":
        return "✗";
      case "completed":
        return "🎉";
      default:
        return "?";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(
        status
      )}`}
    >
      <span className="mr-1">{getIcon()}</span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/**
 * Attempts to discover the current user's email from client-side storage.
 * Checks common locations: localStorage/sessionStorage keys and window globals.
 * Returns an email string (lowercased) or undefined if not found.
 *
 * NOTE: If your app has a proper auth context or store (e.g. Redux, React Context),
 * it's better to read the logged-in user there. This heuristic is a fallback.
 */
function getCurrentUserEmailFromClient(): string | undefined {
  try {
    const tryParse = (v: string | null) => {
      if (!v) return undefined;
      // try JSON parse
      try {
        const obj = JSON.parse(v);
        if (obj && typeof obj === "object") {
          // common fields
          return (obj.email || obj.userEmail || obj.emailAddress) as string | undefined;
        }
      } catch {
        // not JSON
      }
      // treat raw string as email
      if (typeof v === "string" && v.includes("@")) return v;
      return undefined;
    };

    const keys = ["currentUser", "user", "currentUserEmail", "userEmail", "email"];
    for (const k of keys) {
      const lv = localStorage.getItem(k);
      const emailFromLocal = tryParse(lv);
      if (emailFromLocal) return emailFromLocal.toLowerCase();

      const sv = sessionStorage.getItem(k);
      const emailFromSession = tryParse(sv);
      if (emailFromSession) return emailFromSession.toLowerCase();
    }

    // Check window globals
    if (typeof window !== "undefined") {
      interface WindowWithUser extends Window {
        __CURRENT_USER__?: { email?: string };
        __USER__?: { email?: string };
        currentUser?: { email?: string };
      }
      const w = window as WindowWithUser;
      if (w.__CURRENT_USER__ && w.__CURRENT_USER__.email) return String(w.__CURRENT_USER__.email).toLowerCase();
      if (w.__USER__ && w.__USER__.email) return String(w.__USER__.email).toLowerCase();
      if (w.currentUser && w.currentUser.email) return String(w.currentUser.email).toLowerCase();
    }
  } catch (err) {
    // ignore errors
    console.error("getCurrentUserEmailFromClient error", err);
  }
  return undefined;
}

export default function ViewBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // store detected current user email (lowercased) - undefined means "not detected"
  const [currentUserEmail, setCurrentUserEmail] = useState<string | undefined>(undefined);

  useEffect(() => {
    const email = getCurrentUserEmailFromClient();
    if (email) setCurrentUserEmail(email);
  }, []);

  useEffect(() => {
    loadBookings();
  }, []);

  const filterAndSortBookings = useCallback(() => {
    let filtered = [...bookings];

    // If currentUserEmail is present, restrict to bookings of that email only
    if (currentUserEmail) {
      filtered = filtered.filter(b => (b.customerEmail || "").toLowerCase() === currentUserEmail);
    }

    // Filter by search input (email, name, bookingId)
    if (searchEmail.trim()) {
      const q = searchEmail.toLowerCase();
      filtered = filtered.filter(
        booking =>
          (booking.customerEmail || "").toLowerCase().includes(q) ||
          (booking.customerName || "").toLowerCase().includes(q) ||
          (booking.bookingId || "").toLowerCase().includes(q)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
        case "date":
          compareValue = new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime();
          break;
        case "amount":
          compareValue = a.totalAmount - b.totalAmount;
          break;
        case "status":
          compareValue = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    setFilteredBookings(filtered);
  }, [bookings, searchEmail, statusFilter, sortBy, sortOrder, currentUserEmail]);

  useEffect(() => {
    filterAndSortBookings();
  }, [filterAndSortBookings]);

  async function loadBookings() {
    try {
      setLoading(true);
      const data = await fetchAllBookings();
      setBookings(data);
      setError(null);
    } catch (err) {
      console.error("Error loading bookings:", err);
      setError("Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(bookingId: string, newStatus: BookingStatus) {
    try {
      await updateBookingStatus(bookingId, newStatus);
      await loadBookings();
    } catch (err) {
      console.error("Error updating booking status:", err);
      setError("Failed to update booking status. Please try again.");
    }
  }

  async function handleDeleteBooking(bookingId: string) {
    if (!confirm("Are you sure you want to delete this booking? This action cannot be undone.")) {
      return;
    }
    try {
      await deleteBooking(bookingId);
      await loadBookings();
    } catch (err) {
      console.error("Error deleting booking:", err);
      setError("Failed to delete booking. Please try again.");
    }
  }

  function exportToCSV() {
    const headers = [
      "Booking ID",
      "Customer Name",
      "Customer Email",
      "Tour Title",
      "Travel Date",
      "Passengers",
      "Total Amount",
      "Paid Amount",
      "Payment Type",
      "Status",
      "Booking Date",
    ];

    const csvData = filteredBookings.map(booking => [
      booking.bookingId,
      booking.customerName,
      booking.customerEmail,
      booking.tour.title,
      new Date(booking.selectedDate).toLocaleDateString(),
      booking.passengers.toString(),
      booking.totalAmount.toString(),
      booking.paidAmount.toString(),
      booking.paymentType,
      booking.status,
      new Date(booking.bookingDate).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `bookings-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (loading) {
    return <Loading />;
  }

  // summary counts reflect filtered view (user-only when applicable)
  const totalCount = filteredBookings.length;
  const confirmedCount = filteredBookings.filter(b => b.status === "confirmed").length;
  const pendingCount = filteredBookings.filter(b => b.status === "pending").length;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, rgba(249,250,251,1) 0%, rgba(243,244,246,1) 35%, rgba(255,255,255,1) 100%)" }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
              <p className="text-gray-700">
                {currentUserEmail ? `Showing bookings for ${currentUserEmail}` : "Manage and track all tour bookings"}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/routes"
                className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Browse Tours
              </Link>
              <button
                onClick={loadBookings}
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg border border-gray-200 rounded-3xl shadow-lg p-6 mb-6 hover:shadow-xl transition-shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                id="search"
                type="text"
                placeholder="Email, name, or booking ID..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all shadow-sm"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as BookingStatus | "all")}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all shadow-sm"
              >
                <option value="all" className="text-gray-900">All Statuses</option>
                <option value="confirmed" className="text-gray-900">Confirmed</option>
                <option value="pending" className="text-gray-900">Pending</option>
                <option value="completed" className="text-gray-900">Completed</option>
                <option value="cancelled" className="text-gray-900">Cancelled</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date" | "amount" | "status")}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all shadow-sm"
              >
                <option value="date" className="text-gray-900">Booking Date</option>
                <option value="amount" className="text-gray-900">Total Amount</option>
                <option value="status" className="text-gray-900">Status</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all shadow-sm"
              >
                <option value="desc" className="text-gray-900">Newest First</option>
                <option value="asc" className="text-gray-900">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-white/95 to-white/90 rounded-2xl border border-gray-200 p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="text-3xl font-bold text-gray-900">{totalCount}</div>
            <div className="text-sm text-gray-600 font-medium mt-1">Total Bookings</div>
          </div>
          <div className="bg-gradient-to-br from-white/95 to-white/90 rounded-2xl border border-gray-200 p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="text-3xl font-bold text-green-600">{confirmedCount}</div>
            <div className="text-sm text-gray-600 font-medium mt-1">Confirmed</div>
          </div>
          <div className="bg-gradient-to-br from-white/95 to-white/90 rounded-2xl border border-gray-200 p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="text-3xl font-bold text-orange-600">{pendingCount}</div>
            <div className="text-sm text-gray-600 font-medium mt-1">Pending</div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg border border-gray-200 rounded-3xl shadow-xl overflow-hidden">
          {filteredBookings.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">
                {searchEmail || statusFilter !== "all"
                  ? "No bookings match your current filters."
                  : currentUserEmail
                  ? "You have no bookings yet."
                  : "No bookings have been made yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Booking ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tour</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Travel Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-all hover:shadow-md">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{booking.bookingId}</div>
                          <div className="text-sm text-gray-500">{formatDate(booking.bookingDate)}</div>
                          <div className="text-xs text-gray-400">{booking.passengers} passenger{booking.passengers > 1 ? "s" : ""}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                          <div className="text-sm text-gray-500">{booking.customerEmail}</div>
                          <div className="text-sm text-gray-500">{booking.customerPhone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-gray-900 truncate">{booking.tour.title}</div>
                          <div className="text-sm text-gray-500">{booking.tour.durationDays} days</div>
                          <Link to={`/tour/${booking.tour.slug}`} className="text-xs text-blue-600 hover:text-blue-800 underline">View Tour Details</Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(booking.selectedDate).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{formatCurrencyPHP(booking.totalAmount)}</div>
                          <div className="text-sm text-gray-500">Paid: {formatCurrencyPHP(booking.paidAmount)}</div>
                          <div className="text-xs text-gray-400 capitalize">{booking.paymentType}{booking.paymentType === "downpayment" && " (30%)"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={booking.status} />
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking.bookingId, e.target.value as BookingStatus)}
                          className="ml-2 text-xs px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all shadow-sm hover:shadow-md"
                        >
                          <option value="confirmed" className="text-gray-900">Confirmed</option>
                          <option value="pending" className="text-gray-900">Pending</option>
                          <option value="completed" className="text-gray-900">Completed</option>
                          <option value="cancelled" className="text-gray-900">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          {/* IMPORTANT: pass the full booking object in location.state and include the booking DB id in the path.
                              This makes the confirmation page able to read the booking from state (preferred) and/or fetch it
                              by id if needed. */}
                          <Link
                            to={`/booking/confirmation/${booking.id}`}
                            state={{ booking }}
                            className="text-gray-600 hover:text-yellow-600 transition-colors"
                            title="View Details"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>

                          <button onClick={() => handleDeleteBooking(booking.bookingId)} className="text-red-600 hover:text-red-800" title="Delete Booking">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination would go here if needed */}
        {filteredBookings.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {filteredBookings.length} of {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
            </div>
            <div className="text-sm text-gray-500">
              {searchEmail || statusFilter !== "all" ? (
                <button
                  onClick={() => {
                    setSearchEmail("");
                    setStatusFilter("all");
                  }}
                  className="text-gray-700 hover:text-yellow-600 underline font-medium transition-colors"
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}