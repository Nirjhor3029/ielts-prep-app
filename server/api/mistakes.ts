import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { Mistake } from '../models/Mistake.js';

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const chapterId = req.query.chapterId as string;

    const filter: Record<string, unknown> = { userId };
    if (chapterId) filter.chapterId = chapterId;

    const mistakes = await Mistake.find(filter)
      .sort({ createdAt: -1 })
      .populate('chapterId', 'title slug');

    const unreviewedCount = await Mistake.countDocuments({ ...filter, reviewCount: 0 });

    res.json({ mistakes, unreviewedCount });
  } catch (error) {
    console.error('Get mistakes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/review', authMiddleware, async (req: Request, res: Response) => {
  try {
    const mistake = await Mistake.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      { $inc: { reviewCount: 1 }, lastReviewedAt: new Date() },
      { new: true }
    );

    if (!mistake) {
      res.status(404).json({ error: 'Mistake not found' });
      return;
    }

    res.json({ mistake });
  } catch (error) {
    console.error('Review mistake error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const mistake = await Mistake.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!.userId,
    });

    if (!mistake) {
      res.status(404).json({ error: 'Mistake not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete mistake error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
