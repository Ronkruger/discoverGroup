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
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
