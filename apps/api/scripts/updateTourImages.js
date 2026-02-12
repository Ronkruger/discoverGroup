// Update tour images with proper URLs
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const tourSchema = new mongoose.Schema({}, { strict: false });
const Tour = mongoose.model('Tour', tourSchema);

// High-quality Unsplash placeholders for each route
const tourImages = {
  'ROUTE_A': [
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80', // Paris
    'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80', // European cityscape
    'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80'  // Alps
  ],
  'ROUTE_B': [
    'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=800&q=80', // Mediterranean
    'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800&q=80', // European architecture
    'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=800&q=80'  // Historic city
  ],
  'ROUTE_C': [
    'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80', // Rome
    'https://images.unsplash.com/photo-1525874684015-58379d421a52?w=800&q=80', // Vatican
    'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&q=80'  // Italian coast
  ],
  'ROUTE_D': [
    'https://images.unsplash.com/photo-1509003379738-8c7e5c9a5fc5?w=800&q=80', // Swiss Alps
    'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&q=80', // Mountain lake
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'  // Alpine scenery
  ],
  'ROUTE_G': [
    'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&q=80', // Germany
    'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80', // Alpine region
    'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=800&q=80'  // European landmarks
  ],
  'ROUTE_L': [
    'https://images.unsplash.com/photo-1508804052814-cd3ba865a116?w=800&q=80', // Luxury travel
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', // Paris landmarks
    'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&q=80'  // European elegance
  ]
};

async function updateTourImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const tours = await Tour.find({});
    console.log(`📊 Found ${tours.length} tours to update\n`);

    for (const tour of tours) {
      const line = tour.line || 'ROUTE_A';
      const newImages = tourImages[line] || tourImages['ROUTE_A'];
      
      // Use updateOne to directly modify the document
      await Tour.updateOne(
        { _id: tour._id },
        { $set: { images: newImages } }
      );
      
      console.log(`✅ Updated: ${tour.title}`);
      console.log(`   Line: ${line}`);
      console.log(`   Images: ${newImages.length} high-quality URLs`);
      console.log('');
    }

    console.log('✅ All tours updated successfully!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateTourImages();
