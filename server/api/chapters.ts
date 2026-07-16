import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import { Chapter } from '../models/Chapter.js';
import { Attempt } from '../models/Attempt.js';
import { User } from '../models/User.js';

const router = Router();

// Get all chapters (admin: all, public: published only)
router.get('/', async (req: Request, res: Response) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isPublished: true };
    const chapters = await Chapter.find(filter).sort({ order: 1 }).select('-questionSets.questions.correctAnswer');
    res.json({ chapters });
  } catch (error) {
    console.error('Get chapters error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get chapter by slug (with questions for authenticated users)
router.get('/:slug', authMiddleware, async (req: Request, res: Response) => {
  try {
    const chapter = await Chapter.findOne({ slug: req.params.slug });
    if (!chapter) {
      res.status(404).json({ error: 'Chapter not found' });
      return;
    }

    // Get user's attempts for this chapter
    const attempts = await Attempt.find({
      userId: req.user!.userId,
      chapterId: chapter._id,
    }).sort({ createdAt: -1 });

    const lastAttempt = attempts[0];
    const completedAttempts = attempts.length;

    res.json({
      chapter,
      progress: {
        lastScore: lastAttempt ? `${lastAttempt.score}/${lastAttempt.totalQuestions}` : null,
        lastAttemptDate: lastAttempt?.createdAt || null,
        completedAttempts,
        totalAttempts: attempts.length,
      },
    });
  } catch (error) {
    console.error('Get chapter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get questions for a specific question set
router.get('/:slug/questions/:setId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const chapter = await Chapter.findOne({ slug: req.params.slug });
    if (!chapter) {
      res.status(404).json({ error: 'Chapter not found' });
      return;
    }

    const questionSet = chapter.questionSets.id(req.params.setId);
    if (!questionSet) {
      res.status(404).json({ error: 'Question set not found' });
      return;
    }

    // For test mode, strip correct answers
    const mode = req.query.mode as string;
    const questions = questionSet.questions.map((q) => {
      const obj = q.toObject();
      if (mode === 'test') {
        delete obj.correctAnswer;
      }
      return obj;
    });

    res.json({
      questionSet: {
        id: questionSet._id,
        type: questionSet.type,
        title: questionSet.title,
        timeLimitMinutes: questionSet.timeLimitMinutes,
      },
      questions,
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get chapters with user progress
router.get('/with-progress/list', authMiddleware, async (req: Request, res: Response) => {
  try {
    const chapters = await Chapter.find({ isPublished: true }).sort({ order: 1 });

    const userId = req.user!.userId;
    const user = await User.findById(userId).select('role unlockedChapters');
    const isAdmin = user?.role === 'admin';
    const manualUnlocks = new Set((user?.unlockedChapters || []).map((id: any) => id.toString()));

    const attempts = await Attempt.aggregate([
      { $match: { userId: req.user!.userId } },
      {
        $group: {
          _id: '$chapterId',
          lastScore: { $last: '$score' },
          lastTotal: { $last: '$totalQuestions' },
          lastDate: { $last: '$createdAt' },
          count: { $sum: 1 },
        },
      },
    ]);

    const attemptMap = new Map(attempts.map((a) => [a._id.toString(), a]));

    let previousCompleted = true;
    const chaptersWithProgress = chapters.map((ch) => {
      const attempt = attemptMap.get(ch._id.toString());
      const isCompleted = !!attempt;
      const isManuallyUnlocked = manualUnlocks.has(ch._id.toString());
      const isLocked = isAdmin ? false : isManuallyUnlocked ? false : !previousCompleted;
      previousCompleted = isCompleted;

      return {
        ...ch.toObject(),
        isLocked,
        isManuallyUnlocked,
        lastScore: attempt ? `${attempt.lastScore}/${attempt.lastTotal}` : null,
        lastAttemptDate: attempt?.lastDate || null,
        completedAttempts: attempt?.count || 0,
      };
    });

    res.json({ chapters: chaptersWithProgress });
  } catch (error) {
    console.error('Get chapters with progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unlock a chapter manually
router.post('/:id/unlock', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const chapterId = req.params.id;

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      res.status(404).json({ error: 'Chapter not found' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role === 'admin') {
      res.json({ success: true, chapter: chapterId, alreadyUnlocked: true });
      return;
    }

    const alreadyUnlocked = user.unlockedChapters.some(
      (id: any) => id.toString() === chapterId
    );

    if (!alreadyUnlocked) {
      user.unlockedChapters.push(chapter._id);
      await user.save();
    }

    res.json({ success: true, chapter: chapterId, alreadyUnlocked });
  } catch (error) {
    console.error('Unlock chapter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
