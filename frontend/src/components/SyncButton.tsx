import { RefreshCw } from 'lucide-react';
import { useSyncEmails } from '../hooks/useEmails';

export default function SyncButton() {
  const sync = useSyncEmails();

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => sync.mutate()}
        disabled={sync.isPending}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${sync.isPending ? 'animate-spin' : ''}`} />
        {sync.isPending ? 'Syncing...' : 'Sync Gmail'}
      </button>
      {sync.isSuccess && (
        <span className="text-sm text-green-600">
          {sync.data.synced} emails synced
        </span>
      )}
      {sync.isError && (
        <span className="text-sm text-red-600">Sync failed</span>
      )}
    </div>
  );
}
