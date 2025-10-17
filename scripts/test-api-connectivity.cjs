// Simple test to check API connectivity and add sample tour
const http = require('http');

const tourData = {
  title: "Bali Adventure with Multiple Departures",
  slug: "bali-adventure-multiple-departures",
  summary: "Explore the beautiful island of Bali with multiple departure dates throughout the year.",
  durationDays: 7,
  regularPricePerPerson: 89000,
  promoPricePerPerson: 75000,
  countries: ["Indonesia"],
  images: ["/assets/bali-1.jpg"],
  departureDates: [
    {
      startDate: "2026-02-04",
      endDate: "2026-02-18"
    },
    {
      startDate: "2026-05-27", 
      endDate: "2026-06-10"
    },
    {
      startDate: "2026-08-15",
      endDate: "2026-08-29"
    }
  ]
};

const postData = JSON.stringify(tourData);

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/tours',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Testing API connectivity...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

// Write data to request body
req.write(postData);
req.end();