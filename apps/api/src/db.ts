import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/discovergroup';

console.log('MongoDB URI configured:', MONGODB_URI ? MONGODB_URI.substring(0, 30) + '...' : 'NOT SET');

export const connectDB = async () => {
  // Return if already connected
  if (mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB already connected');
    return;
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ MongoDB connection error:', errorMessage);
    console.error('MONGODB_URI:', MONGODB_URI);
    console.error('Make sure MONGODB_URI is set in environment variables');
    throw err; // Re-throw to let the server handle it
  }
};
