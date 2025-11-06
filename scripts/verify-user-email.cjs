/**
 * Script to manually verify a user's email in the database
 * Usage: node scripts/verify-user-email.cjs <email>
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function verifyUserEmail(email) {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;
    
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI or DATABASE_URL not found in environment variables');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      isEmailVerified: Boolean,
      emailVerificationToken: String,
      emailVerificationExpires: Date,
      fullName: String,
    }));

    const user = await User.findOne({ email });
    
    if (!user) {
      console.error(`❌ User with email "${email}" not found`);
      process.exit(1);
    }

    console.log(`\n📧 Found user: ${user.fullName}`);
    console.log(`Current verification status: ${user.isEmailVerified ? '✅ Verified' : '❌ Not Verified'}`);

    if (user.isEmailVerified) {
      console.log('\n✅ User email is already verified!');
    } else {
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();
      
      console.log('\n✅ Email verification successful!');
      console.log('👤 User can now login without email verification.');
    }

    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: node scripts/verify-user-email.cjs <email>');
  process.exit(1);
}

verifyUserEmail(email);
