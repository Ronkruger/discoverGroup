// Merge bookings from bookings.json into backend, preserving all existing backend data
// Run with: node scripts/merge-bookings-json-to-backend.cjs
// Requires: npm install node-fetch

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const BOOKINGS_PATH = path.join(__dirname, '../bookings.json');
const API_BOOKINGS = 'http://localhost:4000/api/bookings';
const API_TOURS = 'http://localhost:4000/admin/tours';

function extractBookingsFromJson() {
  const file = fs.readFileSync(BOOKINGS_PATH, 'utf-8');
  return JSON.parse(file);
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
  if (found) {
    console.log(`Tour ${tour.slug} already exists, checking for updates...`);
    
    // Update tour with multiple departure dates if needed
    const updatedTour = {
      ...tour,
      departureDates: tour.departureDates || [
        // If tour has multiple instances, extract departure dates
        ...(tour.travelWindow ? [`${tour.travelWindow.start} - ${tour.travelWindow.end}`] : [])
      ]
    };
    
    // Update existing tour to ensure it has the latest structure
    try {
      const updateRes = await fetch(`${API_TOURS}/${found._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTour),
      });
      if (updateRes.ok) {
        console.log(`Updated tour ${tour.slug} with latest structure`);
        return await updateRes.json();
      }
    } catch (err) {
      console.warn(`Failed to update tour ${tour.slug}:`, err.message);
    }
    
    return found;
  }
  
  // Create tour if not found
  const tourToCreate = {
    ...tour,
    departureDates: tour.departureDates || [
      // If tour has multiple instances, extract departure dates
      ...(tour.travelWindow ? [`${tour.travelWindow.start} - ${tour.travelWindow.end}`] : [])
    ]
  };
  
  const createRes = await fetch(API_TOURS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tourToCreate),
  });
  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Failed to create tour ${tour.slug}: ${errorText}`);
  }
  console.log(`Created new tour: ${tour.slug}`);
  return await createRes.json();
}

async function merge() {
  console.log('Starting merge process...');
  
  try {
    const bookings = extractBookingsFromJson();
    console.log(`Found ${bookings.length} bookings in JSON file`);
    
    const backendBookings = await getBackendBookings();
    console.log(`Found ${backendBookings.length} existing bookings in backend`);
    
    const backendTours = await getBackendTours();
    console.log(`Found ${backendTours.length} existing tours in backend`);
    
    const backendBookingIds = new Set(backendBookings.map(b => b.bookingId));

    let mergedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const booking of bookings) {
      if (backendBookingIds.has(booking.bookingId)) {
        console.log(`Booking ${booking.bookingId} already exists, skipping.`);
        skippedCount++;
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
          const errorText = await res.text();
          console.error(`Failed to merge booking ${booking.bookingId}:`, errorText);
          errorCount++;
        } else {
          console.log(`✅ Merged booking ${booking.bookingId} for ${booking.customerName}`);
          mergedCount++;
        }
      } catch (err) {
        console.error(`❌ Error merging booking ${booking.bookingId}:`, err.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 Merge Summary:');
    console.log(`✅ Successfully merged: ${mergedCount} bookings`);
    console.log(`⏭️  Skipped (already exist): ${skippedCount} bookings`);
    console.log(`❌ Errors: ${errorCount} bookings`);
    console.log(`📁 Total processed: ${bookings.length} bookings`);
    
  } catch (err) {
    console.error('❌ Merge process failed:', err.message);
    process.exit(1);
  }
}

merge();
