import { Router, Request, Response } from 'express';
import { Analytics } from '../models/Analytics.js';

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

export default router;
