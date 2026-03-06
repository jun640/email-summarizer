export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface EmailSummary {
  id: string;
  emailId: string;
  summaryText: string;
  importance: 'high' | 'medium' | 'low';
  keywords: string;
  createdAt: string;
}

export interface Email {
  id: string;
  gmailId: string;
  userId: string;
  subject: string;
  sender: string;
  receivedAt: string;
  bodyText: string;
  isRead: boolean;
  createdAt: string;
  summary: EmailSummary | null;
}

export interface FilterRule {
  id: string;
  userId: string;
  name: string;
  conditionType: 'subject' | 'sender' | 'keyword';
  conditionValue: string;
  matchType: 'contains' | 'exact' | 'regex';
  isActive: boolean;
  createdAt: string;
}

export interface EmailsResponse {
  emails: Email[];
  total: number;
  page: number;
  totalPages: number;
}
