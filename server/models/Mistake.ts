import mongoose, { Schema, Document } from 'mongoose';

export interface IMistakeDoc extends Document {
  userId: mongoose.Types.ObjectId;
  chapterId: mongoose.Types.ObjectId;
  questionSetId: string;
  questionId: string;
  prompt: string;
  correctAnswer: string;
  userAnswer: string;
  justification: string;
  reviewCount: number;
  lastReviewedAt?: Date;
}

const MistakeSchema = new Schema<IMistakeDoc>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true },
  questionSetId: { type: String, required: true },
  questionId: { type: String, required: true },
  prompt: { type: String, required: true },
  correctAnswer: { type: String, required: true },
  userAnswer: { type: String, required: true },
  justification: { type: String, required: true },
  reviewCount: { type: Number, default: 0 },
  lastReviewedAt: { type: Date },
}, { timestamps: true });

MistakeSchema.index({ userId: 1, createdAt: -1 });
MistakeSchema.index({ userId: 1, chapterId: 1 });

export const Mistake = mongoose.model<IMistakeDoc>('Mistake', MistakeSchema);
