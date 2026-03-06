import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import prisma from '../prismaClient';

const router = Router();

router.use(authMiddleware as any);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const rules = await prisma.filterRule.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, conditionType, conditionValue, matchType } = req.body;

    if (!name || !conditionType || !conditionValue || !matchType) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const validConditionTypes = ['subject', 'sender', 'keyword'];
    const validMatchTypes = ['contains', 'exact', 'regex'];

    if (!validConditionTypes.includes(conditionType)) {
      res.status(400).json({ error: 'Invalid condition type' });
      return;
    }
    if (!validMatchTypes.includes(matchType)) {
      res.status(400).json({ error: 'Invalid match type' });
      return;
    }

    const rule = await prisma.filterRule.create({
      data: { userId: req.userId!, name, conditionType, conditionValue, matchType },
    });
    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create rule' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.filterRule.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existing) {
      res.status(404).json({ error: 'Rule not found' });
      return;
    }

    const { name, conditionType, conditionValue, matchType, isActive } = req.body;
    const rule = await prisma.filterRule.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(conditionType !== undefined && { conditionType }),
        ...(conditionValue !== undefined && { conditionValue }),
        ...(matchType !== undefined && { matchType }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    res.json(rule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update rule' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.filterRule.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existing) {
      res.status(404).json({ error: 'Rule not found' });
      return;
    }

    await prisma.filterRule.delete({ where: { id } });
    res.json({ message: 'Rule deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete rule' });
  }
});

export default router;
