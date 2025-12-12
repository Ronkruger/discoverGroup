# Seed Reviews Script

This script populates the database with initial approved customer reviews/testimonials.

## Prerequisites

- MongoDB running locally or connection string to MongoDB Atlas
- Node.js installed
- Mongoose package installed

## Usage

### Method 1: Using Node directly

```bash
# Navigate to the API directory
cd apps/api

# Run the seed script
node scripts/seedReviews.js
```

### Method 2: Using npm script (if configured)

```bash
# From the root or api directory
npm run seed:reviews
```

### Method 3: With environment variable

```bash
# If using MongoDB Atlas or custom connection string
MONGODB_URI="your-mongodb-connection-string" node scripts/seedReviews.js
```

## What it does

1. Connects to MongoDB
2. Clears existing reviews (optional - can be commented out)
3. Inserts 10 approved customer testimonials with:
   - 5-star ratings
   - Diverse customer names
   - Realistic review comments
   - Associated tour slugs
   - Recent timestamps
4. Displays a summary of inserted reviews

## Customization

You can edit `seedReviews.js` to:
- Add more reviews to the `seedReviews` array
- Change the MongoDB connection string
- Comment out the `deleteMany()` line to keep existing reviews
- Modify review content, ratings, or dates

## Verification

After running the script, you can verify the reviews are in the database:

1. Check MongoDB directly
2. Visit your frontend homepage - reviews should appear in the "What Our Travelers Say" section
3. Call the API endpoint: `GET http://localhost:4000/api/reviews/approved`

## Notes

- All seeded reviews are pre-approved (`isApproved: true`)
- Reviews are distributed across different tours
- Timestamps are set to recent dates for realism
- Names are diverse to represent international customers
