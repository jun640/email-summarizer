import { Email } from '../types';
import ImportanceBadge from './ImportanceBadge';
import { Eye, EyeOff } from 'lucide-react';

interface Props {
  emails: Email[];
  onSelect: (email: Email) => void;
  selectedId?: string | null;
}

export default function EmailList({ emails, onSelect, selectedId }: Props) {
  if (emails.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No emails found. Try syncing your Gmail or adjusting your filter rules.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
      {emails.map((email) => (
        <div
          key={email.id}
          onClick={() => onSelect(email)}
          className={`flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
            selectedId === email.id ? 'bg-blue-50' : ''
          } ${!email.isRead ? 'font-semibold' : ''}`}
        >
          <div className="flex-shrink-0">
            {email.isRead ? (
              <Eye className="w-4 h-4 text-gray-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-blue-500" />
            )}
          </div>
          <div className="flex-shrink-0 w-20">
            {email.summary ? (
              <ImportanceBadge importance={email.summary.importance} />
            ) : (
              <span className="text-xs text-gray-400">-</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm text-gray-900">{email.subject || '(No subject)'}</div>
            <div className="truncate text-xs text-gray-500">{email.sender}</div>
          </div>
          <div className="flex-shrink-0 text-xs text-gray-400">
            {new Date(email.receivedAt).toLocaleDateString('ja-JP', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
