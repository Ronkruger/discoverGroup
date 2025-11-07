import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  fullName: string;
  role: string;
  isActive: boolean;
  phone?: string;
  birthDate?: string;
  gender?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  favorites: string[]; // Array of tour slugs
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  role: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  phone: { type: String },
  birthDate: { type: String },
  gender: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  favorites: { type: [String], default: [] }, // Array of tour slugs
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
