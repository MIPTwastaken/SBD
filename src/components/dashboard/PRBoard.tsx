import { useSessionStore, useSettingsStore } from '../../stores';
import { formatWeight } from '../../utils/units';
import { formatDate } from '../../utils/dates';

export function PRBoard() {
  const prRecords = useSessionStore(s => s.prRecords);
  const unit = useSettingsStore(s => s.settings.weightUnit);

  // Sort PRs by date descending
  const sorted = [...prRecords].sort(
    (a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <h2 className="font-semibold text-sm text-gray-700 mb-2">PR Board</h2>
        <p className="text-sm text-gray-400">No PRs recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <h2 className="font-semibold text-sm text-gray-700 mb-3">PR Board</h2>
      <div className="space-y-2">
        {sorted.slice(0, 10).map(pr => (
          <div
            key={pr.id}
            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
          >
            <div>
              <span className="font-medium text-sm capitalize">{pr.exerciseName}</span>
              <span className="text-xs text-gray-500 ml-2">
                {pr.type === 'e1rm'
                  ? 'e1RM'
                  : pr.type === 'weight_at_reps'
                  ? `${pr.reps}RM`
                  : 'Reps'}
              </span>
            </div>
            <div className="text-right">
              <span className="font-bold text-sm">
                {formatWeight(pr.value, unit)}
              </span>
              {pr.previousValue && (
                <span className="text-xs text-green-600 ml-2">
                  +{formatWeight(pr.value - pr.previousValue, unit)}
                </span>
              )}
              <div className="text-xs text-gray-400">{formatDate(pr.sessionDate)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
