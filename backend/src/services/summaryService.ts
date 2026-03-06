import Anthropic from '@anthropic-ai/sdk';
import prisma from '../prismaClient';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function summarizeEmail(emailId: string) {
  const email = await prisma.email.findUnique({ where: { id: emailId } });
  if (!email) throw new Error('Email not found');

  const existing = await prisma.emailSummary.findUnique({ where: { emailId } });
  if (existing) return existing;

  const bodyTruncated = email.bodyText.substring(0, 5000);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `以下のメールを日本語で要約してください。
【出力形式】JSON形式のみで返してください（コードブロックやマークダウンは不要です）:
{ "summary": "3〜5行の要約", "importance": "high|medium|low", "keywords": ["kw1","kw2","kw3"] }
重要度の基準: high=即時対応必要, medium=確認推奨, low=参考情報

件名: ${email.subject}
送信者: ${email.sender}
本文: ${bodyTruncated}`,
      },
    ],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

  let parsed: { summary: string; importance: string; keywords: string[] };
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
  } catch {
    parsed = {
      summary: responseText,
      importance: 'medium',
      keywords: [],
    };
  }

  const importance = ['high', 'medium', 'low'].includes(parsed.importance) ? parsed.importance : 'medium';

  const summary = await prisma.emailSummary.create({
    data: {
      emailId,
      summaryText: parsed.summary,
      importance,
      keywords: JSON.stringify(parsed.keywords || []),
    },
  });

  return summary;
}
