import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { Attempt } from '../models/Attempt.js';
import { Mistake } from '../models/Mistake.js';
import { User } from '../models/User.js';
import { Chapter } from '../models/Chapter.js';
import { Analytics } from '../models/Analytics.js';

const router = Router();

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { chapterId, questionSetId, mode, answers, startedAt } = req.body;
    const userId = req.user!.userId;

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      res.status(404).json({ error: 'Chapter not found' });
      return;
    }

    const questionSet = chapter.questionSets.id(questionSetId);
    if (!questionSet) {
      res.status(404).json({ error: 'Question set not found' });
      return;
    }

    let score = 0;
    const processedAnswers = answers.map((ans: { questionId: string; userAnswer: string }) => {
      const question = questionSet.questions.id(ans.questionId);
      const isCorrect = question
        ? String(question.correctAnswer).toLowerCase().trim() === String(ans.userAnswer).toLowerCase().trim()
        : false;
      if (isCorrect) score++;

      return {
        questionId: ans.questionId,
        userAnswer: ans.userAnswer,
        isCorrect,
      };
    });

    const attempt = await Attempt.create({
      userId,
      chapterId,
      questionSetId,
      mode,
      answers: processedAnswers,
      score,
      totalQuestions: answers.length,
      startedAt: new Date(startedAt),
      completedAt: new Date(),
    });

    // Save mistakes to Mistakes collection
    const mistakes = processedAnswers
      .filter((a) => !a.isCorrect)
      .map((a) => {
        const question = questionSet.questions.id(a.questionId);
        return {
          userId,
          chapterId,
          questionSetId,
          questionId: a.questionId,
          prompt: question?.prompt || '',
          correctAnswer: String(question?.correctAnswer || ''),
          userAnswer: a.userAnswer,
          justification: question?.justification || '',
        };
      });

    if (mistakes.length > 0) {
      await Mistake.insertMany(mistakes);
    }

    // Update user stats
    const correctCount = score;
    await User.findByIdAndUpdate(userId, {
      $inc: {
        totalCorrect: correctCount,
        totalAttempts: 1,
      },
      lastActiveAt: new Date(),
    });

    // Update daily analytics
    const today = new Date().toISOString().split('T')[0];
    const scorePercent = answers.length > 0 ? (score / answers.length) * 100 : 0;
    await Analytics.findOneAndUpdate(
      { date: today },
      {
        $inc: { totalAttempts: 1 },
        $set: { averageScore: scorePercent },
        $push: {
          topChapters: {
            $each: [{ chapterId: String(chapterId), count: 1 }],
            $slice: -20,
          },
        },
      },
      { upsert: true }
    );

    res.status(201).json({
      attempt: {
        id: attempt._id,
        score,
        totalQuestions: answers.length,
        answers: processedAnswers,
        completedAt: attempt.completedAt,
      },
    });
  } catch (error) {
    console.error('Create attempt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const attempts = await Attempt.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('chapterId', 'title slug');

    const total = await Attempt.countDocuments({ userId });

    res.json({ attempts, total, page, limit });
  } catch (error) {
    console.error('Get attempts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const stats = await Attempt.aggregate([
      { $match: { userId: req.user!.userId } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: '$score' },
          totalQuestions: { $sum: '$totalQuestions' },
          totalCorrect: { $sum: '$score' },
        },
      },
    ]);

    const recentAttempts = await Attempt.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('chapterId', 'title');

    const topChapter = await Attempt.aggregate([
      { $match: { userId: req.user!.userId } },
      {
        $group: {
          _id: '$chapterId',
          count: { $sum: 1 },
          avgScore: { $avg: { $divide: ['$score', '$totalQuestions'] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
      { $lookup: { from: 'chapters', localField: '_id', foreignField: '_id', as: 'chapter' } },
      { $unwind: '$chapter' },
      { $project: { title: '$chapter.title', count: 1, avgScore: 1 } },
    ]);

    res.json({
      summary: stats[0] || { totalAttempts: 0, averageScore: 0, totalQuestions: 0, totalCorrect: 0 },
      recentAttempts,
      topChapter: topChapter[0] || null,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const attempt = await Attempt.findOne({
      _id: req.params.id,
      userId: req.user!.userId,
    }).populate('chapterId', 'title slug');

    if (!attempt) {
      res.status(404).json({ error: 'Attempt not found' });
      return;
    }

    res.json({ attempt });
  } catch (error) {
    console.error('Get attempt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
