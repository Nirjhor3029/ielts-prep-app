import { Router, Request, Response } from 'express';
import { connectDB } from '../lib/db.js';
import authRouter from './auth.js';
import chaptersRouter from './chapters.js';
import attemptsRouter from './attempts.js';
import mistakesRouter from './mistakes.js';
import adminRouter from './admin.js';
import analyticsRouter from './analytics.js';
import progressRouter from './progress.js';

const app = Router();

app.use('/auth', authRouter);
app.use('/chapters', chaptersRouter);
app.use('/attempts', attemptsRouter);
app.use('/mistakes', mistakesRouter);
app.use('/admin', adminRouter);
app.use('/analytics', analyticsRouter);
app.use('/progress', progressRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Vercel serverless: export as default handler
export default async function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  await connectDB();
  app(req, res);
}

// Local dev: start Express server
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  import('express').then(({ default: express }) => {
    const expressApp = express();
    expressApp.use(express.json({ limit: '10mb' }));
    expressApp.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }
      next();
    });
    expressApp.use('/api', app);

    const PORT = process.env.PORT || 3001;

    connectDB().then(() => {
      expressApp.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    });
  });
}
