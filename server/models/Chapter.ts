import mongoose, { Schema, Document } from 'mongoose';

const QuestionSchema = new Schema({
  type: { type: String, enum: ['mcq', 'fill-blank', 'error-identification', 'sentence-correction'], required: true },
  prompt: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: Schema.Types.Mixed, required: true },
  justification: { type: String, required: true },
}, { _id: true });

const QuestionSetSchema = new Schema({
  type: { type: String, enum: ['practice', 'test'], required: true },
  title: { type: String, required: true },
  timeLimitMinutes: { type: Number },
  questions: [QuestionSchema],
}, { _id: true });

const VocabSchema = new Schema({
  word: { type: String, required: true },
  meaning: { type: String, required: true },
  example: { type: String, required: true },
  partOfSpeech: { type: String, required: true },
}, { _id: true });

export interface IChapterDoc extends Document {
  module: string;
  phaseTitle: string;
  chapterGroup: string;
  moduleTitle: string;
  title: string;
  slug: string;
  order: number;
  description: string;
  readTimeMinutes: number;
  difficulty: string;
  notes: string;
  icon: string;
  subTopics: string[];
  vocab: mongoose.Types.DocumentArray<{
    word: string;
    meaning: string;
    example: string;
    partOfSpeech: string;
  }>;
  questionSets: mongoose.Types.DocumentArray<{
    type: string;
    title: string;
    timeLimitMinutes?: number;
    questions: mongoose.Types.DocumentArray<{
      type: string;
      prompt: string;
      options?: string[];
      correctAnswer: string | string[];
      justification: string;
    }>;
  }>;
  isPublished: boolean;
}

const ChapterSchema = new Schema<IChapterDoc>({
  module: { type: String, required: true, default: 'grammar' },
  phaseTitle: { type: String, default: '' },
  chapterGroup: { type: String, default: '' },
  moduleTitle: { type: String, default: '' },
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  order: { type: Number, required: true, unique: true },
  description: { type: String, required: true },
  readTimeMinutes: { type: Number, required: true, default: 10 },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  notes: { type: String, default: '' },
  icon: { type: String, default: 'menu_book' },
  subTopics: [{ type: String }],
  vocab: [VocabSchema],
  questionSets: [QuestionSetSchema],
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

ChapterSchema.index({ slug: 1 }, { unique: true });
ChapterSchema.index({ order: 1 }, { unique: true });
ChapterSchema.index({ isPublished: 1, order: 1 });

export const Chapter = mongoose.model<IChapterDoc>('Chapter', ChapterSchema);
