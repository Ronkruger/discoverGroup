import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/discovergroup';

console.log('MongoDB URI configured:', MONGODB_URI ? MONGODB_URI.substring(0, 30) + '...' : 'NOT SET');

export const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ MongoDB connection error:', errorMessage);
    console.error('Make sure MONGODB_URI is set in environment variables');
    process.exit(1);
  }
};
