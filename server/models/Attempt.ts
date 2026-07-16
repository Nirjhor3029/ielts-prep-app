import mongoose, { Schema, Document } from 'mongoose';

const AttemptAnswerSchema = new Schema({
  questionId: { type: String, required: true },
  userAnswer: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
}, { _id: false });

export interface IAttemptDoc extends Document {
  userId: mongoose.Types.ObjectId;
  chapterId: mongoose.Types.ObjectId;
  questionSetId: string;
  mode: 'practice' | 'test';
  answers: { questionId: string; userAnswer: string; isCorrect: boolean }[];
  score: number;
  totalQuestions: number;
  startedAt: Date;
  completedAt: Date;
  createdAt?: Date;
}

const AttemptSchema = new Schema<IAttemptDoc>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true },
  questionSetId: { type: String, required: true },
  mode: { type: String, enum: ['practice', 'test'], required: true },
  answers: [AttemptAnswerSchema],
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  startedAt: { type: Date, required: true },
  completedAt: { type: Date, required: true },
}, { timestamps: true });

AttemptSchema.index({ userId: 1, createdAt: -1 });
AttemptSchema.index({ userId: 1, chapterId: 1 });

export const Attempt = mongoose.model<IAttemptDoc>('Attempt', AttemptSchema);
