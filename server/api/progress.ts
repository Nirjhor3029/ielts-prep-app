import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { UserProgress } from '../models/UserProgress.js';
import { VocabSentence } from '../models/VocabSentence.js';
import { User } from '../models/User.js';
import { Chapter } from '../models/Chapter.js';

const router = Router();

// --- Static routes FIRST (before /:chapterId) ---

// GET /api/progress/stats — get user's overall progress stats
router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const [progressStats, user] = await Promise.all([
      UserProgress.aggregate([
        { $match: { userId: userId as any } },
        {
          $group: {
            _id: null,
            totalChaptersStarted: { $sum: { $cond: [{ $ne: ['$status', 'not_started'] }, 1, 0] } },
            totalChaptersMastered: { $sum: { $cond: [{ $eq: ['$status', 'mastered'] }, 1, 0] } },
            averageChallengeScore: { $avg: { $cond: [{ $gt: ['$challengeScore', 0] }, '$challengeScore', null] } },
            totalStars: { $sum: '$stars' },
            totalTimeSpent: { $sum: '$totalTimeSpent' },
          },
        },
      ]),
      User.findById(userId).select('xp level streak streakFreezes achievements'),
    ]);

    const stats = progressStats[0] || {
      totalChaptersStarted: 0,
      totalChaptersMastered: 0,
      averageChallengeScore: 0,
      totalStars: 0,
      totalTimeSpent: 0,
    };

    res.json({
      stats: {
        ...stats,
        xp: user?.xp || 0,
        level: user?.level || 1,
        streak: user?.streak || 0,
        streakFreezes: user?.streakFreezes || 0,
        achievements: user?.achievements || [],
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/progress/review-due — get chapters due for review
router.get('/review-due', authMiddleware, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const due = await UserProgress.find({
      userId: req.user!.userId,
      nextReviewAt: { $lte: now },
      status: 'mastered',
    }).populate('chapterId', 'title slug icon');

    res.json({ reviewDue: due });
  } catch (error) {
    console.error('Get review due error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/progress/review — complete a spaced repetition review
router.post('/review', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { chapterId, score } = req.body;

    const progress = await UserProgress.findOne({
      userId: req.user!.userId,
      chapterId,
    });

    if (!progress) {
      res.status(404).json({ error: 'Progress not found' });
      return;
    }

    progress.reviewCount += 1;

    if (score >= 80) {
      progress.reviewInterval = Math.min(progress.reviewInterval * 2, 30);
    } else {
      progress.reviewInterval = 1;
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + progress.reviewInterval);
    progress.nextReviewAt = nextReview;
    progress.lastStudiedAt = new Date();

    await progress.save();

    res.json({ progress });
  } catch (error) {
    console.error('Complete review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/progress/sentences/:id/like — like a community sentence
router.post('/sentences/:id/like', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const sentence = await VocabSentence.findById(req.params.id);

    if (!sentence) {
      res.status(404).json({ error: 'Sentence not found' });
      return;
    }

    const alreadyLiked = sentence.likedBy.includes(userId as any);
    if (alreadyLiked) {
      sentence.likedBy = sentence.likedBy.filter((id) => id.toString() !== userId);
      sentence.likes = Math.max(0, sentence.likes - 1);
    } else {
      sentence.likedBy.push(userId as any);
      sentence.likes += 1;
    }

    await sentence.save();
    res.json({ sentence, liked: !alreadyLiked });
  } catch (error) {
    console.error('Like sentence error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Parameterized routes AFTER static routes ---

// GET /api/progress/:chapterId — get user progress for a chapter
router.get('/:chapterId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const progress = await UserProgress.findOne({
      userId: req.user!.userId,
      chapterId: req.params.chapterId,
    });

    if (!progress) {
      res.json({
        progress: {
          cardsRead: [],
          practiceScore: 0,
          practiceCompleted: false,
          challengeScore: 0,
          challengeCompleted: false,
          stars: 0,
          vocabStagesCompleted: [],
          vocabSentences: [],
          totalTimeSpent: 0,
          status: 'not_started',
          reviewCount: 0,
        },
      });
      return;
    }

    res.json({ progress });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/progress/:chapterId/card — mark a study card as read
router.post('/:chapterId/card', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      res.status(400).json({ error: 'Topic is required' });
      return;
    }

    const progress = await UserProgress.findOneAndUpdate(
      { userId: req.user!.userId, chapterId: req.params.chapterId },
      {
        $addToSet: { cardsRead: topic },
        $set: { lastStudiedAt: new Date(), status: 'in_progress' },
      },
      { upsert: true, new: true }
    );

    res.json({ progress });
  } catch (error) {
    console.error('Mark card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/progress/:chapterId/practice — save practice score
router.post('/:chapterId/practice', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { score } = req.body;

    const progress = await UserProgress.findOneAndUpdate(
      { userId: req.user!.userId, chapterId: req.params.chapterId },
      {
        $max: { practiceScore: score },
        $set: { practiceCompleted: true, lastStudiedAt: new Date(), status: 'in_progress' },
      },
      { upsert: true, new: true }
    );

    const xpGain = 20 + Math.floor(score / 10);
    await User.findByIdAndUpdate(req.user!.userId, {
      $inc: { xp: xpGain },
      $set: { lastStudyDate: new Date() },
    });

    res.json({ progress, xpGain });
  } catch (error) {
    console.error('Save practice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/progress/:chapterId/challenge — save challenge score + compute stars
router.post('/:chapterId/challenge', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { score, totalQuestions } = req.body;
    const percentage = Math.round((score / totalQuestions) * 100);

    let stars = 0;
    if (percentage >= 90) stars = 3;
    else if (percentage >= 70) stars = 2;
    else if (percentage > 0) stars = 1;

    const progress = await UserProgress.findOneAndUpdate(
      { userId: req.user!.userId, chapterId: req.params.chapterId },
      {
        $max: { challengeScore: percentage, stars },
        $set: {
          challengeCompleted: true,
          lastStudiedAt: new Date(),
          status: stars === 3 ? 'mastered' : 'completed',
        },
      },
      { upsert: true, new: true }
    );

    if (stars === 3) {
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + 1);
      await UserProgress.findOneAndUpdate(
        { userId: req.user!.userId, chapterId: req.params.chapterId },
        { $set: { masteredAt: new Date(), nextReviewAt: nextReview, reviewInterval: 1 } }
      );
    }

    const xpGain = 20 + (stars * 25);
    await User.findByIdAndUpdate(req.user!.userId, {
      $inc: { xp: xpGain },
      $set: { lastStudyDate: new Date() },
    });

    res.json({ progress, xpGain, stars });
  } catch (error) {
    console.error('Save challenge error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/progress/:chapterId/vocab — update vocab progress
router.post('/:chapterId/vocab', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { word, stage } = req.body;
    if (!word || !stage) {
      res.status(400).json({ error: 'Word and stage are required' });
      return;
    }

    const progress = await UserProgress.findOne({
      userId: req.user!.userId,
      chapterId: req.params.chapterId,
    });

    if (!progress) {
      res.status(404).json({ error: 'No progress found for this chapter' });
      return;
    }

    const vocabEntry = progress.vocabStagesCompleted.find((v) => v.word === word);
    if (vocabEntry) {
      if (!vocabEntry.stages.includes(stage)) {
        vocabEntry.stages.push(stage);
      }
    } else {
      progress.vocabStagesCompleted.push({ word, stages: [stage] });
    }

    await progress.save();

    const xpGain = 3;
    await User.findByIdAndUpdate(req.user!.userId, {
      $inc: { xp: xpGain },
      $set: { lastStudyDate: new Date() },
    });

    res.json({ progress, xpGain });
  } catch (error) {
    console.error('Update vocab error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/progress/:chapterId/sentence — add a vocab sentence
router.post('/:chapterId/sentence', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { word, sentence } = req.body;
    if (!word || !sentence) {
      res.status(400).json({ error: 'Word and sentence are required' });
      return;
    }

    const vocabSentence = await VocabSentence.create({
      userId: req.user!.userId,
      chapterId: req.params.chapterId as any,
      word: word.toLowerCase(),
      sentence,
    });

    await UserProgress.findOneAndUpdate(
      { userId: req.user!.userId, chapterId: req.params.chapterId },
      {
        $push: { vocabSentences: { word, sentence, createdAt: new Date() } },
        $set: { lastStudiedAt: new Date() },
      },
      { upsert: true }
    );

    await User.findByIdAndUpdate(req.user!.userId, {
      $inc: { xp: 5 },
      $set: { lastStudyDate: new Date() },
    });

    res.json({ sentence: vocabSentence, xpGain: 5 });
  } catch (error) {
    console.error('Add sentence error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/progress/:chapterId/sentences — get community sentences for a word
router.get('/:chapterId/sentences', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { word } = req.query;
    const filter: any = { chapterId: req.params.chapterId };
    if (word) filter.word = (word as string).toLowerCase();

    const sentences = await VocabSentence.find(filter)
      .populate('userId', 'name avatarUrl')
      .sort({ likes: -1 })
      .limit(20);

    res.json({ sentences });
  } catch (error) {
    console.error('Get sentences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
