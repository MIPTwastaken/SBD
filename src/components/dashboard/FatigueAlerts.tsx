import { useFatigueFlags } from '../../hooks/useFatigueFlags';

export function FatigueAlerts() {
  const flags = useFatigueFlags();

  if (flags.length === 0) return null;

  return (
    <div className="mb-4">
      {flags.map((flag, i) => (
        <div
          key={i}
          className={`rounded-lg border p-3 mb-2 text-sm ${
            flag.type === 'e1rm_drop'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span className="font-medium">
            {flag.type === 'e1rm_drop' ? 'e1RM Drop' : 'RPE Streak'}
          </span>
          {': '}
          {flag.message}
        </div>
      ))}
    </div>
  );
}
