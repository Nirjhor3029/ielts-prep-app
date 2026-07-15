import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import { Analytics } from '../models/Analytics.js';
import { User } from '../models/User.js';
import { Attempt } from '../models/Attempt.js';
import { Chapter } from '../models/Chapter.js';

const router = Router();

router.post('/visit', async (req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { isNewUser } = req.body;

    await Analytics.findOneAndUpdate(
      { date: today },
      {
        $inc: {
          uniqueVisitors: 1,
          newUsers: isNewUser ? 1 : 0,
          returningUsers: isNewUser ? 0 : 1,
        },
      },
      { upsert: true, new: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Track visit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/dashboard', authMiddleware, adminMiddleware, async (_req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAttempts = await Attempt.countDocuments();

    const scoreAgg = await Attempt.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$score' }, totalCorrect: { $sum: '$score' }, totalQ: { $sum: '$totalQuestions' } } },
    ]);
    const overallAvg = scoreAgg[0] ? ((scoreAgg[0].totalCorrect / scoreAgg[0].totalQ) * 10).toFixed(1) : '0.0';

    const today = new Date().toISOString().split('T')[0];
    const todayDoc = await Analytics.findOne({ date: today });
    const todayVisitors = todayDoc?.uniqueVisitors || 0;

    const last7Days = await Analytics.find()
      .sort({ date: -1 })
      .limit(7)
      .lean();

    const chapterStats = await Attempt.aggregate([
      {
        $group: {
          _id: '$chapterId',
          attempts: { $sum: 1 },
          avgScore: { $avg: { $divide: ['$score', '$totalQuestions'] } },
          totalCorrect: { $sum: '$score' },
          totalQ: { $sum: '$totalQuestions' },
        },
      },
      { $sort: { attempts: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'chapters',
          localField: '_id',
          foreignField: '_id',
          as: 'chapter',
        },
      },
      { $unwind: { path: '$chapter', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          title: { $ifNull: ['$chapter.title', 'Unknown'] },
          slug: { $ifNull: ['$chapter.slug', ''] },
          difficulty: { $ifNull: ['$chapter.difficulty', 'beginner'] },
          attempts: 1,
          avgScorePercent: { $round: [{ $multiply: ['$avgScore', 100] }, 0] },
          accuracy: { $round: [{ $multiply: [{ $divide: ['$totalCorrect', '$totalQ'] }, 100] }, 0] },
        },
      },
    ]);

    const userRanking = await Attempt.aggregate([
      {
        $group: {
          _id: '$userId',
          attempts: { $sum: 1 },
          totalCorrect: { $sum: '$score' },
          totalQ: { $sum: '$totalQuestions' },
          bestScore: { $max: '$score' },
        },
      },
      { $sort: { attempts: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ['$user.name', 'Unknown'] },
          email: { $ifNull: ['$user.email', ''] },
          role: { $ifNull: ['$user.role', 'user'] },
          attempts: 1,
          totalCorrect: 1,
          accuracy: { $round: [{ $multiply: [{ $divide: ['$totalCorrect', '$totalQ'] }, 100] }, 0] },
          bestScore: 1,
        },
      },
    ]);

    res.json({
      summary: {
        totalUsers,
        totalAttempts,
        overallAvg,
        todayVisitors,
      },
      dailyVisitors: last7Days.reverse().map((d) => ({
        date: d.date,
        visitors: d.uniqueVisitors,
        newUsers: d.newUsers,
        returningUsers: d.returningUsers,
      })),
      chapterStats,
      userRanking,
    });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
