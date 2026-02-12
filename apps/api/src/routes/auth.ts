import express from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendVerificationEmail } from '../services/emailService';
import logger from '../utils/logger';
import * as tokenService from '../services/tokenService';

const router = express.Router();

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
  const { email, password, fullName, role, phone, birthDate, gender } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Email, password, and full name are required' });
  }
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  
  const hashed = await bcrypt.hash(password, 12);
  
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
      logger.error('Failed to send verification email:', emailResult.error);
    }
  } catch (error) {
    logger.error('Error sending verification email:', error);
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
  } catch (error) {
    logger.error(`Registration error: ${error}`);
    res.status(500).json({ error: 'Registration failed' });
  }
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
    
    // Generate access and refresh tokens
    const ipAddress = req.ip || req.socket.remoteAddress;
    const tokens = await tokenService.generateTokenPair(
      user._id.toString(),
      user.role,
      ipAddress
    );
    
    res.json({
      success: true,
      message: 'Email verified successfully! You can now login.',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
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
    logger.info(`Attempting to send verification email to: ${email}`);
    const emailResult = await sendVerificationEmail(email, user.fullName, verificationToken);
    
    if (!emailResult.success) {
      logger.error(`Email sending failed: ${emailResult.error}`);
      return res.status(500).json({ 
        error: 'Failed to send verification email. Please contact support.',
        details: process.env.NODE_ENV === 'development' ? emailResult.error : undefined
      });
    }
    
    logger.info('Verification email sent successfully');
    res.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.',
    });
  } catch (error) {
    logger.error(`Resend verification error: ${error}`);
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
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
  try {
    const { email, password } = req.body;
    logger.info(`Login attempt for email: ${email}`);
  
  if (!email || !password) {
    logger.warn('Login attempt with missing credentials');
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  const user = await User.findOne({ email });
  if (!user) {
    logger.warn(`Login attempt for non-existent email: ${email}`);
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    logger.warn(`Failed login attempt for email: ${email}`);
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

  // Generate access and refresh tokens
  const ipAddress = req.ip || req.socket.remoteAddress;
  const tokens = await tokenService.generateTokenPair(
    user._id.toString(),
    user.role,
    ipAddress
  );

  logger.info(`Login successful for email: ${email}`);
  res.json({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
    },
  });
  } catch (error) {
    logger.error(`Login error: ${error}`);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

// POST /auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists for security
      return res.status(200).json({ message: 'If the email exists, a password reset link has been sent.' });
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Save token to database
    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // Send reset email
    try {
      const emailService = await import('../services/emailService');
      const emailResult = await emailService.sendPasswordResetEmail(email, user.fullName, resetUrl);
      if (!emailResult.success) {
        logger.error('Failed to send password reset email:', emailResult.error);
        return res.status(500).json({ error: 'Failed to send reset email' });
      }
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      return res.status(500).json({ error: 'Failed to send reset email' });
    }

    logger.info(`Password reset email sent to: ${email}`);
    res.status(200).json({ message: 'If the email exists, a password reset link has been sent.' });
  } catch (error) {
    logger.error(`Forgot password error: ${error}`);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// POST /auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Hash the token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    logger.info(`Password reset successful for: ${user.email}`);
    
    // Revoke all refresh tokens for security
    const ipAddress = req.ip || req.socket.remoteAddress;
    await tokenService.revokeAllUserTokens(user._id.toString(), ipAddress);
    
    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    logger.error(`Reset password error: ${error}`);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// POST /auth/refresh-token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }
    
    const ipAddress = req.ip || req.socket.remoteAddress;
    const result = await tokenService.refreshAccessToken(refreshToken, ipAddress);
    
    logger.info(`Access token refreshed for user: ${result.userId}`);
    res.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    logger.error(`Refresh token error: ${error}`);
    const message = error instanceof Error ? error.message : 'Failed to refresh token';
    res.status(401).json({ error: message });
  }
});

// POST /auth/logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }
    
    const ipAddress = req.ip || req.socket.remoteAddress;
    await tokenService.revokeRefreshToken(refreshToken, ipAddress);
    
    logger.info('User logged out successfully');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error(`Logout error: ${error}`);
    // Return 200 even on error - logout should always succeed from client perspective
    res.status(200).json({ message: 'Logged out' });
  }
});

export default router;
