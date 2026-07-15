import mongoose, { Schema, Document } from 'mongoose';

export interface IVocabSentenceDoc extends Document {
  userId: mongoose.Types.ObjectId;
  chapterId: mongoose.Types.ObjectId;
  word: string;
  sentence: string;
  likes: number;
  likedBy: mongoose.Types.ObjectId[];
}

const VocabSentenceSchema = new Schema<IVocabSentenceDoc>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true },
  word: { type: String, required: true, lowercase: true, trim: true },
  sentence: { type: String, required: true, trim: true },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

VocabSentenceSchema.index({ word: 1, chapterId: 1 });
VocabSentenceSchema.index({ userId: 1 });
VocabSentenceSchema.index({ likes: -1 });

export const VocabSentence = mongoose.model<IVocabSentenceDoc>('VocabSentence', VocabSentenceSchema);
