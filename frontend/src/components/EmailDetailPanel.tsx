import { useState } from 'react';
import { X, Sparkles, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Email } from '../types';
import ImportanceBadge from './ImportanceBadge';
import { useSummarizeEmail, useMarkRead } from '../hooks/useEmails';

interface Props {
  email: Email;
  onClose: () => void;
}

export default function EmailDetailPanel({ email, onClose }: Props) {
  const [showBody, setShowBody] = useState(false);
  const summarize = useSummarizeEmail();
  const markRead = useMarkRead();

  const keywords: string[] = email.summary?.keywords
    ? (() => { try { return JSON.parse(email.summary.keywords); } catch { return []; } })()
    : [];

  const handleMarkRead = () => {
    markRead.mutate({ id: email.id, isRead: !email.isRead });
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl border-l border-gray-200 z-40 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900 truncate">{email.subject || '(No subject)'}</h2>
        <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Meta */}
        <div className="space-y-1">
          <div className="text-sm text-gray-600">
            <span className="font-medium">From:</span> {email.sender}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Date:</span>{' '}
            {new Date(email.receivedAt).toLocaleString('ja-JP')}
          </div>
          <div className="flex items-center gap-2 mt-2">
            {email.summary && <ImportanceBadge importance={email.summary.importance} />}
            <button
              onClick={handleMarkRead}
              className="text-xs text-blue-600 hover:underline"
            >
              {email.isRead ? 'Mark as unread' : 'Mark as read'}
            </button>
          </div>
        </div>

        {/* AI Summary */}
        {email.summary ? (
          <div className="bg-blue-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-sm font-medium text-blue-700">
              <Sparkles className="w-4 h-4" />
              AI Summary
            </div>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {email.summary.summaryText}
            </p>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {keywords.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white rounded text-xs text-gray-600 border border-gray-200">
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4">
            <button
              onClick={() => summarize.mutate(email.id)}
              disabled={summarize.isPending}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${summarize.isPending ? 'animate-spin' : ''}`} />
              {summarize.isPending ? 'Summarizing...' : 'Generate AI Summary'}
            </button>
          </div>
        )}

        {/* Re-summarize */}
        {email.summary && (
          <button
            onClick={() => summarize.mutate(email.id)}
            disabled={summarize.isPending}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600"
          >
            <RefreshCw className={`w-3 h-3 ${summarize.isPending ? 'animate-spin' : ''}`} />
            Re-summarize
          </button>
        )}

        {/* Full body */}
        <div>
          <button
            onClick={() => setShowBody(!showBody)}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            {showBody ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showBody ? 'Hide full text' : 'Show full text'}
          </button>
          {showBody && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {email.bodyText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
