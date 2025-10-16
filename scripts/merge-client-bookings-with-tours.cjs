// Merge client bookings and tours into backend, preserving all existing backend data
// Run with: node scripts/merge-client-bookings-with-tours.cjs
// Requires: npm install node-fetch

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const BOOKINGS_PATH = path.join(__dirname, '../src/api/bookings.ts');
const TOURS_PATH = path.join(__dirname, '../src/api/tours.ts'); // If you have a tours file
const API_BOOKINGS = 'http://localhost:4000/api/bookings';
const API_TOURS = 'http://localhost:4000/admin/tours';

function extractLocalBookings() {
  const file = fs.readFileSync(BOOKINGS_PATH, 'utf-8');
  const bookingsArrMatch = file.match(/mockBookings\s*=\s*(\[[\s\S]*?\]);/);
  if (!bookingsArrMatch) throw new Error('Could not find mockBookings array');
  let bookingsStr = bookingsArrMatch[1]
    .replace(/\bBooking\b/g, '')
    .replace(/\/[/*].*?\n/g, '')
    .replace(/new Date\([^)]*\)/g, '"2024-01-01T00:00:00.000Z"');
  return eval(bookingsStr);
}

async function getBackendBookings() {
  const res = await fetch(API_BOOKINGS);
  if (!res.ok) throw new Error('Failed to fetch backend bookings');
  return await res.json();
}

async function getBackendTours() {
  const res = await fetch(API_TOURS);
  if (!res.ok) throw new Error('Failed to fetch backend tours');
  return await res.json();
}

async function ensureTourExists(tour, backendTours) {
  const found = backendTours.find(t => t.slug === tour.slug);
  if (found) return found;
  // Create tour if not found
  const createRes = await fetch(API_TOURS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tour),
  });
  if (!createRes.ok) throw new Error(`Failed to create tour: ${tour.slug}`);
  return await createRes.json();
}

async function merge() {
  const bookings = extractLocalBookings();
  const backendBookings = await getBackendBookings();
  const backendTours = await getBackendTours();
  const backendBookingIds = new Set(backendBookings.map(b => b.bookingId));

  for (const booking of bookings) {
    if (backendBookingIds.has(booking.bookingId)) {
      console.log(`Booking ${booking.bookingId} already exists, skipping.`);
      continue;
    }
    // Ensure referenced tour exists
    try {
      const tour = await ensureTourExists(booking.tour, backendTours);
      const payload = {
        tourSlug: tour.slug,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        customerPassport: booking.customerPassport,
        selectedDate: booking.selectedDate,
        passengers: booking.passengers,
        perPerson: booking.perPerson,
        totalAmount: booking.totalAmount,
        paidAmount: booking.paidAmount,
        paymentType: booking.paymentType,
        status: booking.status,
        bookingId: booking.bookingId,
        bookingDate: booking.bookingDate,
        paymentIntentId: booking.paymentIntentId,
        notes: booking.notes || '',
      };
      const res = await fetch(API_BOOKINGS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        console.error(`Failed to merge booking ${booking.bookingId}:`, await res.text());
      } else {
        console.log(`Merged booking ${booking.bookingId}`);
      }
    } catch (err) {
      console.error(`Error merging booking ${booking.bookingId}:`, err);
    }
  }
}

merge();
