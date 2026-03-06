import { google } from 'googleapis';
import prisma from '../prismaClient';
import { FilterRule } from '@prisma/client';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

export function createOAuth2Client() {
  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
}

export function getAuthUrl(): string {
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
  });
}

export async function getTokensFromCode(code: string) {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export async function getGoogleUserInfo(accessToken: string) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();
  return data;
}

interface EmailData {
  gmailId: string;
  subject: string;
  sender: string;
  receivedAt: Date;
  bodyText: string;
}

function getHeader(headers: any[], name: string): string {
  return headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';
}

function decodeBase64Url(data: string): string {
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(base64, 'base64').toString('utf-8');
}

function extractBody(payload: any): string {
  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }
    }
    for (const part of payload.parts) {
      const nested = extractBody(part);
      if (nested) return nested;
    }
  }
  return '';
}

export function matchesFilterRules(email: EmailData, rules: FilterRule[]): boolean {
  if (rules.length === 0) return true;

  return rules.some(rule => {
    if (!rule.isActive) return false;

    let target = '';
    switch (rule.conditionType) {
      case 'subject': target = email.subject; break;
      case 'sender': target = email.sender; break;
      case 'keyword': target = `${email.subject} ${email.bodyText}`; break;
      default: return false;
    }

    switch (rule.matchType) {
      case 'contains': return target.toLowerCase().includes(rule.conditionValue.toLowerCase());
      case 'exact': return target.toLowerCase() === rule.conditionValue.toLowerCase();
      case 'regex': {
        try {
          return new RegExp(rule.conditionValue, 'i').test(target);
        } catch {
          return false;
        }
      }
      default: return false;
    }
  });
}

async function getAuthenticatedClient(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.googleAccessToken) throw new Error('User not authenticated with Google');

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
  });

  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          googleAccessToken: tokens.access_token,
          ...(tokens.refresh_token ? { googleRefreshToken: tokens.refresh_token } : {}),
        },
      });
    }
  });

  return oauth2Client;
}

export async function syncEmails(userId: string): Promise<{ synced: number }> {
  const oauth2Client = await getAuthenticatedClient(userId);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const listRes = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 50,
    q: 'in:inbox',
  });

  const messages = listRes.data.messages || [];
  const rules = await prisma.filterRule.findMany({ where: { userId } });

  let synced = 0;
  let summarized = 0;

  for (const msg of messages) {
    const existing = await prisma.email.findUnique({ where: { gmailId: msg.id! } });
    if (existing) continue;

    const detail = await gmail.users.messages.get({ userId: 'me', id: msg.id!, format: 'full' });
    const headers = detail.data.payload?.headers || [];

    const emailData: EmailData = {
      gmailId: msg.id!,
      subject: getHeader(headers, 'Subject'),
      sender: getHeader(headers, 'From'),
      receivedAt: new Date(parseInt(detail.data.internalDate || '0')),
      bodyText: extractBody(detail.data.payload),
    };

    if (!matchesFilterRules(emailData, rules)) continue;

    const saved = await prisma.email.create({
      data: {
        gmailId: emailData.gmailId,
        userId,
        subject: emailData.subject,
        sender: emailData.sender,
        receivedAt: emailData.receivedAt,
        bodyText: emailData.bodyText.substring(0, 10000),
      },
    });
    synced++;
  }

  return { synced };
}
