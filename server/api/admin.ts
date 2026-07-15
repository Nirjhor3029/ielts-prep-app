import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import { Chapter } from '../models/Chapter.js';

const router = Router();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

router.post('/chapters', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, module, order, description, readTimeMinutes, difficulty, notes, icon, questionSets, isPublished } = req.body;

    if (!title || order === undefined) {
      res.status(400).json({ error: 'Title and order are required' });
      return;
    }

    const slug = slugify(title);
    const existing = await Chapter.findOne({ $or: [{ slug }, { order }] });
    if (existing) {
      res.status(409).json({ error: 'A chapter with this title or order already exists' });
      return;
    }

    const chapter = await Chapter.create({
      title,
      slug,
      module: module || 'grammar',
      order,
      description: description || '',
      readTimeMinutes: readTimeMinutes || 10,
      difficulty: difficulty || 'beginner',
      notes: notes || '',
      icon: icon || 'menu_book',
      questionSets: questionSets || [],
      isPublished: isPublished || false,
    });

    res.status(201).json({ chapter });
  } catch (error) {
    console.error('Create chapter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/chapters/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const chapter = await Chapter.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!chapter) {
      res.status(404).json({ error: 'Chapter not found' });
      return;
    }

    res.json({ chapter });
  } catch (error) {
    console.error('Update chapter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/chapters/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const chapter = await Chapter.findByIdAndDelete(req.params.id);
    if (!chapter) {
      res.status(404).json({ error: 'Chapter not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete chapter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/chapters/:id/publish', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      res.status(404).json({ error: 'Chapter not found' });
      return;
    }

    chapter.isPublished = !chapter.isPublished;
    await chapter.save();

    res.json({ chapter });
  } catch (error) {
    console.error('Toggle publish error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
