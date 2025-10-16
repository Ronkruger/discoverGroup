// Migrate all client bookings to backend, ensuring referenced tours exist
// Run with: node scripts/migrate-client-bookings-with-tours.js
// Requires: npm install node-fetch

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const BOOKINGS_PATH = path.join(__dirname, '../src/api/bookings.ts');
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

async function ensureTourExists(tour) {
  // Check if tour exists by slug
  const res = await fetch(`${API_TOURS}?slug=${tour.slug}`);
  if (res.ok) {
    const tours = await res.json();
    if (Array.isArray(tours) && tours.length > 0) return tours[0];
  }
  // Create tour if not found
  const createRes = await fetch(API_TOURS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tour),
  });
  if (!createRes.ok) throw new Error(`Failed to create tour: ${tour.slug}`);
  return await createRes.json();
}

async function migrate() {
  const bookings = extractLocalBookings();
  for (const booking of bookings) {
    // Ensure referenced tour exists
    try {
      const tour = await ensureTourExists(booking.tour);
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
        console.error(`Failed to migrate booking ${booking.bookingId}:`, await res.text());
      } else {
        console.log(`Migrated booking ${booking.bookingId}`);
      }
    } catch (err) {
      console.error(`Error migrating booking ${booking.bookingId}:`, err);
    }
  }
}

migrate();
