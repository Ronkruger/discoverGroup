import jwt from 'jsonwebtoken';
import RefreshToken from '../models/RefreshToken';
import logger from '../utils/logger';

/**
 * Token Service
 * Handles creation and management of access and refresh tokens
 */

const ACCESS_TOKEN_EXPIRY = '1h'; // Short-lived access token
const REFRESH_TOKEN_EXPIRY_DAYS = 7; // Refresh token lasts 7 days

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate access token (JWT)
 */
export function generateAccessToken(userId: string, role: string): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

/**
 * Generate refresh token and store in database
 */
export async function generateRefreshToken(
  userId: string,
  ipAddress?: string
): Promise<string> {
  // Generate secure random token
  const token = RefreshToken.generateToken();
  
  // Calculate expiration
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  // Create refresh token document
  await RefreshToken.create({
    token,
    userId,
    expiresAt,
    createdByIp: ipAddress,
  });

  return token;
}

/**
 * Generate both access and refresh tokens
 */
export async function generateTokenPair(
  userId: string,
  role: string,
  ipAddress?: string
): Promise<TokenPair> {
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = await generateRefreshToken(userId, ipAddress);

  return { accessToken, refreshToken };
}

/**
 * Verify and rotate refresh token
 * Returns new token pair if valid, throws error if invalid
 */
export async function refreshAccessToken(
  token: string,
  ipAddress?: string
): Promise<{ accessToken: string; refreshToken: string; userId: string; role: string }> {
  // Find the refresh token in database
  const refreshToken = await RefreshToken.findOne({ token }).populate('userId');

  if (!refreshToken) {
    throw new Error('Invalid refresh token');
  }

  // Check if token is active
  if (!refreshToken.isActive) {
    throw new Error('Refresh token is expired or revoked');
  }

  // Get user from populated field
  const user = refreshToken.userId as unknown as { _id: { toString(): string }; role: string };
  if (!user) {
    throw new Error('User not found');
  }

  // Revoke old refresh token (rotation for security)
  refreshToken.revokedAt = new Date();
  refreshToken.revokedByIp = ipAddress;
  refreshToken.revokedReason = 'Replaced by new token';
  await refreshToken.save();

  // Generate new token pair
  const newAccessToken = generateAccessToken(user._id.toString(), user.role);
  const newRefreshToken = await generateRefreshToken(user._id.toString(), ipAddress);

  // Update the old token to track replacement
  refreshToken.replacedByToken = newRefreshToken;
  await refreshToken.save();

  logger.info(`Refresh token rotated for user: ${user._id}`);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    userId: user._id.toString(),
    role: user.role,
  };
}

/**
 * Revoke refresh token (for logout)
 */
export async function revokeRefreshToken(
  token: string,
  ipAddress?: string
): Promise<void> {
  const refreshToken = await RefreshToken.findOne({ token });

  if (!refreshToken) {
    throw new Error('Refresh token not found');
  }

  if (!refreshToken.isActive) {
    throw new Error('Refresh token is already revoked or expired');
  }

  refreshToken.revokedAt = new Date();
  refreshToken.revokedByIp = ipAddress;
  refreshToken.revokedReason = 'User logout';
  await refreshToken.save();

  logger.info(`Refresh token revoked for user: ${refreshToken.userId}`);
}

/**
 * Revoke all refresh tokens for a user (for security actions like password change)
 */
export async function revokeAllUserTokens(
  userId: string,
  ipAddress?: string
): Promise<number> {
  const tokens = await RefreshToken.find({
    userId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  for (const token of tokens) {
    token.revokedAt = new Date();
    token.revokedByIp = ipAddress;
    token.revokedReason = 'All tokens revoked';
    await token.save();
  }

  logger.info(`Revoked ${tokens.length} refresh tokens for user: ${userId}`);
  return tokens.length;
}

/**
 * Get active refresh tokens for a user
 */
export async function getUserActiveTokens(userId: string): Promise<number> {
  const count = await RefreshToken.countDocuments({
    userId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  return count;
}

/**
 * Clean up expired or old refresh tokens (for maintenance)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await RefreshToken.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { revokedAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }, // Revoked >30 days ago
    ],
  });

  logger.info(`Cleaned up ${result.deletedCount} expired refresh tokens`);
  return result.deletedCount || 0;
}
