import { useState } from 'react';
import { useEmails, useEmail } from '../hooks/useEmails';
import { useRules, useUpdateRule } from '../hooks/useRules';
import Layout from '../components/Layout';
import EmailList from '../components/EmailList';
import EmailDetailPanel from '../components/EmailDetailPanel';
import SyncButton from '../components/SyncButton';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Email } from '../types';

export default function DashboardPage() {
  const [page, setPage] = useState(1);
  const [importance, setImportance] = useState<string>('');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  const { data, isLoading } = useEmails(page, importance || undefined);
  const { data: selectedEmail } = useEmail(selectedEmailId);
  const { data: rules } = useRules();
  const updateRule = useUpdateRule();

  const handleSelect = (email: Email) => {
    setSelectedEmailId(email.id);
  };

  return (
    <Layout>
      <div className="flex gap-6">
        {/* Sidebar: Filter Rules */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-20">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 mb-3">
              <Filter className="w-4 h-4" />
              Filter Rules
            </h3>
            {rules && rules.length > 0 ? (
              <div className="space-y-2">
                {rules.map((rule) => (
                  <label key={rule.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={rule.isActive}
                      onChange={() => updateRule.mutate({ id: rule.id, isActive: !rule.isActive })}
                      className="rounded border-gray-300"
                    />
                    <span className={rule.isActive ? 'text-gray-900' : 'text-gray-400 line-through'}>
                      {rule.name}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No rules configured. Go to Rules page to create one.</p>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <SyncButton />
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Importance:</label>
              <select
                value={importance}
                onChange={(e) => { setImportance(e.target.value); setPage(1); }}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : (
            <>
              <EmailList
                emails={data?.emails || []}
                onSelect={handleSelect}
                selectedId={selectedEmailId}
              />

              {data && data.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-md border border-gray-300 disabled:opacity-30 hover:bg-gray-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {data.page} / {data.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                    disabled={page === data.totalPages}
                    className="p-1.5 rounded-md border border-gray-300 disabled:opacity-30 hover:bg-gray-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedEmail && (
        <EmailDetailPanel
          email={selectedEmail}
          onClose={() => setSelectedEmailId(null)}
        />
      )}
    </Layout>
  );
}
