import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDoc extends Document {
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
  streak: number;
  totalCorrect: number;
  totalAttempts: number;
  lastActiveAt?: Date;
  xp: number;
  level: number;
  lastStudyDate?: Date;
  streakFreezes: number;
  achievements: string[];
  unlockedChapters: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<IUserDoc>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  avatarUrl: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  streak: { type: Number, default: 0 },
  totalCorrect: { type: Number, default: 0 },
  totalAttempts: { type: Number, default: 0 },
  lastActiveAt: { type: Date },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  lastStudyDate: { type: Date },
  streakFreezes: { type: Number, default: 0 },
  achievements: [{ type: String }],
  unlockedChapters: [{ type: Schema.Types.ObjectId, ref: 'Chapter' }],
}, { timestamps: true });

UserSchema.index({ email: 1 }, { unique: true });

export const User = mongoose.model<IUserDoc>('User', UserSchema);
