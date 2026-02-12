// Check existing tours in the database
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const tourSchema = new mongoose.Schema({}, { strict: false });
const Tour = mongoose.model('Tour', tourSchema);

async function checkTours() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const tours = await Tour.find({}).select('title images line duration').lean();
    
    console.log(`\n📊 Found ${tours.length} tours in database:\n`);
    
    tours.forEach((tour, index) => {
      console.log(`${index + 1}. ${tour.title}`);
      console.log(`   Line: ${tour.line}`);
      console.log(`   Duration: ${tour.duration}`);
      console.log(`   Images: ${tour.images?.length || 0} image(s)`);
      if (tour.images && tour.images.length > 0) {
        tour.images.forEach((img, i) => {
          console.log(`     [${i + 1}] ${img}`);
        });
      } else {
        console.log(`     ⚠️  No images found!`);
      }
      console.log('');
    });

    await mongoose.disconnect();
    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkTours();
