// Script to migrate all real bookings from client localStorage (mockBookings) to backend MongoDB
// Usage: Run this script with Node.js in the project root after starting the backend and MongoDB
// This script assumes the backend API is running at http://localhost:4000

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Path to the client mock bookings file
const BOOKINGS_PATH = path.join(__dirname, '../src/api/bookings.ts');

// Backend API endpoint for creating bookings (you may need to adjust this)
const API_URL = 'http://localhost:4000/api/bookings';

// Helper to extract mock bookings from the TypeScript file
function extractMockBookings() {
  const file = fs.readFileSync(BOOKINGS_PATH, 'utf-8');
  const bookingsMatch = file.match(/const sampleBookings: Booking\[] = ([\s\S]*?);\n\s*mockBookings = sampleBookings;/);
  if (!bookingsMatch) throw new Error('Could not find sampleBookings array');
  // This is a hacky eval, but safe since it's local dev data
  // Replace TypeScript types and comments
  let bookingsStr = bookingsMatch[1]
    .replace(/\bBooking\b/g, '')
    .replace(/\/[/*].*?\n/g, '')
    .replace(/new Date\([^)]*\)/g, '"2024-01-01T00:00:00.000Z"');
  return eval('(' + bookingsStr + ')');
}

async function migrate() {
  const bookings = extractMockBookings();
  for (const booking of bookings) {
    // Map fields to backend Booking model
    const payload = {
      // You may need to map user and tour to ObjectIds or look them up
      user: null, // Set to a valid user ObjectId if available
      tour: null, // Set to a valid tour ObjectId if available
      passengers: booking.passengers,
      totalAmount: booking.totalAmount,
      status: booking.status,
      // Add more fields as needed
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
