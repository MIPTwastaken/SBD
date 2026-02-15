import { useAnchors } from '../../hooks/useAnchors';
import { formatWeight } from '../../utils/units';
import { formatDate } from '../../utils/dates';
import { useSettingsStore } from '../../stores';

export function AnchorsCard() {
  const anchors = useAnchors();
  const unit = useSettingsStore(s => s.settings.weightUnit);

  if (anchors.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <h2 className="font-semibold text-sm text-gray-700 mb-2">Loading Anchors</h2>
        <p className="text-sm text-gray-400">
          No anchors yet — log a T1 session to establish anchors.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <h2 className="font-semibold text-sm text-gray-700 mb-3">Loading Anchors</h2>
      <div className="grid grid-cols-2 gap-3">
        {anchors.map(anchor => (
          <div
            key={anchor.lift}
            className="bg-gray-50 rounded-md p-3"
          >
            <div className="text-xs text-gray-500 capitalize">{anchor.lift}</div>
            <div className="text-lg font-bold text-gray-900">
              {formatWeight(anchor.e1rm, unit)}
            </div>
            <div className="text-xs text-gray-400">{formatDate(anchor.date)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
