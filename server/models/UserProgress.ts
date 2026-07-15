import mongoose, { Schema, Document } from 'mongoose';

const VocabStageSchema = new Schema({
  word: { type: String, required: true },
  stages: [{ type: String, enum: ['learn', 'recall', 'match', 'use'] }],
}, { _id: false });

const VocabSentenceSchema = new Schema({
  word: { type: String, required: true },
  sentence: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

export interface IUserProgressDoc extends Document {
  userId: mongoose.Types.ObjectId;
  chapterId: mongoose.Types.ObjectId;
  cardsRead: string[];
  practiceScore: number;
  practiceCompleted: boolean;
  challengeScore: number;
  challengeCompleted: boolean;
  stars: number;
  vocabStagesCompleted: { word: string; stages: string[] }[];
  vocabSentences: { word: string; sentence: string; createdAt: Date }[];
  totalTimeSpent: number;
  lastStudiedAt?: Date;
  nextReviewAt?: Date;
  reviewInterval: number;
  reviewCount: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'mastered';
  masteredAt?: Date;
}

const UserProgressSchema = new Schema<IUserProgressDoc>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true },
  cardsRead: [{ type: String }],
  practiceScore: { type: Number, default: 0 },
  practiceCompleted: { type: Boolean, default: false },
  challengeScore: { type: Number, default: 0 },
  challengeCompleted: { type: Boolean, default: false },
  stars: { type: Number, default: 0, min: 0, max: 3 },
  vocabStagesCompleted: [VocabStageSchema],
  vocabSentences: [VocabSentenceSchema],
  totalTimeSpent: { type: Number, default: 0 },
  lastStudiedAt: { type: Date },
  nextReviewAt: { type: Date },
  reviewInterval: { type: Number, default: 1 },
  reviewCount: { type: Number, default: 0 },
  status: { type: String, enum: ['not_started', 'in_progress', 'completed', 'mastered'], default: 'not_started' },
  masteredAt: { type: Date },
}, { timestamps: true });

UserProgressSchema.index({ userId: 1, chapterId: 1 }, { unique: true });
UserProgressSchema.index({ userId: 1, nextReviewAt: 1 });

export const UserProgress = mongoose.model<IUserProgressDoc>('UserProgress', UserProgressSchema);
