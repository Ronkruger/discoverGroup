import mongoose from 'mongoose';
import logger from './utils/logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/discovergroup';
const isProduction = process.env.NODE_ENV === 'production';

// Only log partial URI in production for security
if (isProduction) {
  logger.info('MongoDB URI configured: [REDACTED FOR SECURITY]');
} else {
  logger.info(`MongoDB URI configured: ${MONGODB_URI.substring(0, 30)}...`);
}

export const connectDB = async () => {
  // Return if already connected
  if (mongoose.connection.readyState === 1) {
    logger.info('✅ MongoDB already connected');
    return;
  }

  try {
    logger.info('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    logger.info('✅ MongoDB connected successfully');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    logger.error('❌ MongoDB connection error:', errorMessage);
    
    // Only log connection string in development for debugging
    if (!isProduction) {
      logger.error('MONGODB_URI:', MONGODB_URI);
    }
    
    logger.error('Make sure MONGODB_URI is set in environment variables');
    throw err; // Re-throw to let the server handle it
  }
};
