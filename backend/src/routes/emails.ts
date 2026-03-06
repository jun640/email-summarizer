import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { summarizeEmail } from '../services/summaryService';
import { syncEmails } from '../services/gmailService';
import prisma from '../prismaClient';

const router = Router();

router.use(authMiddleware as any);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const importance = req.query.importance as string;

    const where: any = { userId: req.userId };
    if (importance) {
      where.summary = { importance };
    }

    const [emails, total] = await Promise.all([
      prisma.email.findMany({
        where,
        include: { summary: true },
        orderBy: { receivedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.email.count({ where }),
    ]);

    res.json({ emails, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const email = await prisma.email.findFirst({
      where: { id, userId: req.userId },
      include: { summary: true },
    });
    if (!email) {
      res.status(404).json({ error: 'Email not found' });
      return;
    }
    res.json(email);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch email' });
  }
});

router.post('/:id/summarize', async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const email = await prisma.email.findFirst({
      where: { id, userId: req.userId },
    });
    if (!email) {
      res.status(404).json({ error: 'Email not found' });
      return;
    }

    // Delete existing summary to re-generate
    await prisma.emailSummary.deleteMany({ where: { emailId: email.id } });
    const summary = await summarizeEmail(email.id);
    res.json(summary);
  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({ error: 'Failed to summarize email' });
  }
});

router.patch('/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const email = await prisma.email.findFirst({
      where: { id, userId: req.userId },
    });
    if (!email) {
      res.status(404).json({ error: 'Email not found' });
      return;
    }

    const updated = await prisma.email.update({
      where: { id: email.id },
      data: { isRead: req.body.isRead ?? true },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update email' });
  }
});

router.post('/sync', async (req: AuthRequest, res: Response) => {
  try {
    const result = await syncEmails(req.userId!);
    res.json(result);
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Failed to sync emails' });
  }
});

export default router;
