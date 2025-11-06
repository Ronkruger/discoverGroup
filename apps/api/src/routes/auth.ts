import express from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendVerificationEmail } from '../services/emailService';

const router = express.Router();

// POST /auth/register
router.post('/register', async (req, res) => {
  const { email, password, fullName, role, phone, birthDate, gender } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Email, password, and full name are required' });
  }
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  
  const hashed = await bcrypt.hash(password, 10);
  
  // Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  const user = await User.create({
    email,
    password: hashed,
    fullName,
    role: role || 'client',
    phone,
    birthDate,
    gender,
    isEmailVerified: false,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: verificationExpires,
  });

  // Send verification email
  try {
    const emailResult = await sendVerificationEmail(email, fullName, verificationToken);
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
    }
  } catch (error) {
    console.error('Error sending verification email:', error);
  }

  // Don't create JWT token yet - user needs to verify email first
  res.status(201).json({
    success: true,
    message: 'Registration successful! Please check your email to verify your account.',
    requiresVerification: true,
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      isEmailVerified: false,
    },
  });
});

// GET /auth/verify-email
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Verification token is required' });
  }
  
  try {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });
    
    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid or expired verification token',
        expired: true 
      });
    }
    
    // Verify the email
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    // Create JWT token now that email is verified
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'changeme', 
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Email verified successfully! You can now login.',
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: true,
      },
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

// POST /auth/resend-verification
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }
    
    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();
    
    // Send verification email
    console.log('📧 Attempting to send verification email to:', email);
    const emailResult = await sendVerificationEmail(email, user.fullName, verificationToken);
    
    if (!emailResult.success) {
      console.error('❌ Email sending failed:', emailResult.error);
      return res.status(500).json({ 
        error: 'Failed to send verification email. Please contact support.',
        details: process.env.NODE_ENV === 'development' ? emailResult.error : undefined
      });
    }
    
    console.log('✅ Verification email sent successfully');
    res.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.',
    });
  } catch (error) {
    console.error('❌ Resend verification error:', error);
    res.status(500).json({ 
      error: 'Failed to resend verification email',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
});

// GET /auth/me
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme') as jwt.JwtPayload;
    const user = await User.findById(decoded.id as string);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const obj = 'toObject' in user
      ? (user as { toObject: () => Record<string, unknown> }).toObject()
      : (user as Record<string, unknown>);
    res.json({
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      phone: user.phone,
      birthDate: user.birthDate,
      gender: user.gender,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('LOGIN ATTEMPT:', { email, password });
  if (!email || !password) {
    console.log('Missing email or password');
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const user = await User.findOne({ email });
  console.log('User found in DB:', user);
  if (!user) {
    console.log('No user found for email:', email);
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  console.log('Password match:', isMatch);
  if (!isMatch) {
    console.log('Password mismatch for user:', email);
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Check if email is verified (only for client role)
  if (user.role === 'client' && !user.isEmailVerified) {
    return res.status(403).json({ 
      error: 'Please verify your email before logging in. Check your inbox for the verification link.',
      requiresVerification: true,
      email: user.email 
    });
  }

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'changeme', { expiresIn: '7d' });

  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
    },
  });
});

export default router;
