import { Router, Request, Response } from 'express';
import { getAuthUrl, getTokensFromCode, getGoogleUserInfo } from '../services/gmailService';
import { generateToken, AuthRequest, authMiddleware } from '../middleware/auth';
import prisma from '../prismaClient';

const router = Router();

router.get('/google', (_req: Request, res: Response) => {
  const url = getAuthUrl();
  res.redirect(url);
});

router.get('/callback', async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    if (!code) {
      res.status(400).json({ error: 'No authorization code' });
      return;
    }

    const tokens = await getTokensFromCode(code);
    const userInfo = await getGoogleUserInfo(tokens.access_token!);

    const user = await prisma.user.upsert({
      where: { email: userInfo.email! },
      update: {
        name: userInfo.name,
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token || undefined,
      },
      create: {
        email: userInfo.email!,
        name: userInfo.name,
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
      },
    });

    const jwtToken = generateToken(user.id);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${jwtToken}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?error=auth_failed`);
  }
});

router.get('/me', authMiddleware as any, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

router.post('/logout', (_req: Request, res: Response) => {
  res.json({ message: 'Logged out' });
});

export default router;
