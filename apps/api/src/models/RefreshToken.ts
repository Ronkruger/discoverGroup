import mongoose, { Schema, Document, Model } from 'mongoose';
import crypto from 'crypto';

export interface IRefreshToken extends Document {
  token: string;
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdByIp?: string;
  revokedAt?: Date;
  revokedByIp?: string;
  revokedReason?: string;
  replacedByToken?: string;
  isExpired: boolean;
  isRevoked: boolean;
  isActive: boolean;
  revoke(ip?: string, reason?: string, replacedByToken?: string): void;
}

export interface RefreshTokenModel extends Model<IRefreshToken> {
  generateToken(): string;
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  token: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  expiresAt: { 
    type: Date, 
    required: true,
    index: true 
  },
  createdByIp: { type: String },
  revokedAt: { type: Date },
  revokedByIp: { type: String },
  revokedReason: { type: String },
  replacedByToken: { type: String },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual properties for token status
RefreshTokenSchema.virtual('isExpired').get(function() {
  return Date.now() >= this.expiresAt.getTime();
});

RefreshTokenSchema.virtual('isRevoked').get(function() {
  return !!this.revokedAt;
});

RefreshTokenSchema.virtual('isActive').get(function() {
  return !this.isRevoked && !this.isExpired;
});

// Static method to generate secure random token
RefreshTokenSchema.statics.generateToken = function(): string {
  return crypto.randomBytes(40).toString('hex');
};

// Method to revoke token
RefreshTokenSchema.methods.revoke = function(ip?: string, reason?: string, replacedByToken?: string) {
  this.revokedAt = new Date();
  this.revokedByIp = ip;
  this.revokedReason = reason;
  this.replacedByToken = replacedByToken;
};

// Index for automatic cleanup of expired tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IRefreshToken, RefreshTokenModel>('RefreshToken', RefreshTokenSchema);
