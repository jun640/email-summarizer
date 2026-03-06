const config = {
  high: { label: 'High', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  low: { label: 'Low', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
};

export default function ImportanceBadge({ importance }: { importance: 'high' | 'medium' | 'low' }) {
  const c = config[importance] || config.medium;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
