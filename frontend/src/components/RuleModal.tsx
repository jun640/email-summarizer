import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { FilterRule } from '../types';

interface Props {
  rule?: FilterRule | null;
  onSave: (data: { name: string; conditionType: string; conditionValue: string; matchType: string }) => void;
  onClose: () => void;
}

export default function RuleModal({ rule, onSave, onClose }: Props) {
  const [name, setName] = useState('');
  const [conditionType, setConditionType] = useState('subject');
  const [conditionValue, setConditionValue] = useState('');
  const [matchType, setMatchType] = useState('contains');

  useEffect(() => {
    if (rule) {
      setName(rule.name);
      setConditionType(rule.conditionType);
      setConditionValue(rule.conditionValue);
      setMatchType(rule.matchType);
    }
  }, [rule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, conditionType, conditionValue, matchType });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">{rule ? 'Edit Rule' : 'New Rule'}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Important senders"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition Type</label>
            <select
              value={conditionType}
              onChange={(e) => setConditionType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="subject">Subject</option>
              <option value="sender">Sender</option>
              <option value="keyword">Keyword (subject + body)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Match Type</label>
            <select
              value={matchType}
              onChange={(e) => setMatchType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="contains">Contains</option>
              <option value="exact">Exact Match</option>
              <option value="regex">Regex</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
            <input
              type="text"
              value={conditionValue}
              onChange={(e) => setConditionValue(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., @example.com"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              {rule ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
