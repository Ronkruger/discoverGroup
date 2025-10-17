// Script to check current bookings in MongoDB via API
const http = require('http');

console.log('🔍 Checking current bookings in MongoDB...');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/bookings',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const bookings = JSON.parse(data);
      console.log(`\n📋 Found ${bookings.length} bookings in MongoDB:`);
      
      bookings.forEach((booking, index) => {
        console.log(`\n${index + 1}. Booking ID: ${booking.bookingId}`);
        console.log(`   Customer: ${booking.customerName} (${booking.customerEmail})`);
        console.log(`   Date: ${booking.selectedDate}`);
        console.log(`   Passengers: ${booking.passengers}`);
        console.log(`   Total: PHP ${booking.totalAmount}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Payment Intent: ${booking.paymentIntentId || 'N/A'}`);
        console.log(`   Created: ${booking.bookingDate}`);
      });
      
      console.log(`\n✅ Successfully retrieved ${bookings.length} bookings from MongoDB`);
    } catch (error) {
      console.error('❌ Error parsing bookings data:', error);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Problem with request: ${e.message}`);
});

req.end();