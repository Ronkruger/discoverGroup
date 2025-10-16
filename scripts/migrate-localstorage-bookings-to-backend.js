// Script to migrate all client localStorage bookings to backend via /api/bookings
// Run this in Node.js from the project root (after starting backend)
// Requires node-fetch: npm install node-fetch

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Path to the client mock bookings file
const BOOKINGS_PATH = path.join(__dirname, '../src/api/bookings.ts');

// Backend API endpoint for creating bookings
const API_URL = 'http://localhost:4000/api/bookings';

function extractLocalBookings() {
  // Try to find the localStorage mockBookings array
  const file = fs.readFileSync(BOOKINGS_PATH, 'utf-8');
  const bookingsArrMatch = file.match(/mockBookings\s*=\s*(\[[\s\S]*?\]);/);
  if (!bookingsArrMatch) throw new Error('Could not find mockBookings array');
  // This is a hacky eval, but safe for local dev
  let bookingsStr = bookingsArrMatch[1]
    .replace(/\bBooking\b/g, '')
    .replace(/\/[/*].*?\n/g, '')
    .replace(/new Date\([^)]*\)/g, '"2024-01-01T00:00:00.000Z"');
  return eval(bookingsStr);
}

async function migrate() {
  const bookings = extractLocalBookings();
  for (const booking of bookings) {
    const payload = {
      tourSlug: booking.tour.slug,
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
    try {
      const res = await fetch(API_URL, {
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
