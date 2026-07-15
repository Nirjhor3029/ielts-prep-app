import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalyticsDoc extends Document {
  date: string;
  uniqueVisitors: number;
  newUsers: number;
  returningUsers: number;
  totalAttempts: number;
  averageScore: number;
  topChapters: { chapterId: string; count: number }[];
}

const AnalyticsSchema = new Schema<IAnalyticsDoc>({
  date: { type: String, required: true, unique: true },
  uniqueVisitors: { type: Number, default: 0 },
  newUsers: { type: Number, default: 0 },
  returningUsers: { type: Number, default: 0 },
  totalAttempts: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  topChapters: [{ chapterId: String, count: Number }],
}, { timestamps: true });

AnalyticsSchema.index({ date: 1 }, { unique: true });

export const Analytics = mongoose.model<IAnalyticsDoc>('Analytics', AnalyticsSchema);
