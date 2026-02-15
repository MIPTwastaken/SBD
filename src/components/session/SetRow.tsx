import { computeE1RM } from '../../calculations';
import { formatWeight } from '../../utils/units';
import { useSettingsStore } from '../../stores';

interface SetRowProps {
  index: number;
  weight: number;
  reps: number;
  rpe?: number;
  onWeightChange: (v: number) => void;
  onRepsChange: (v: number) => void;
  onRpeChange: (v: number | undefined) => void;
  onRemove: () => void;
}

export function SetRow({
  index,
  weight,
  reps,
  rpe,
  onWeightChange,
  onRepsChange,
  onRpeChange,
  onRemove,
}: SetRowProps) {
  const unit = useSettingsStore(s => s.settings.weightUnit);
  const e1rm = weight > 0 && reps >= 1 ? computeE1RM(weight, reps, rpe) : null;

  return (
    <tr className="border-b border-gray-100">
      <td className="py-2 pr-2 text-gray-500 text-sm">{index + 1}</td>
      <td className="py-2 pr-2">
        <input
          type="number"
          min={0}
          step={0.5}
          value={weight || ''}
          onChange={e => onWeightChange(parseFloat(e.target.value) || 0)}
          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
          placeholder={unit}
        />
      </td>
      <td className="py-2 pr-2">
        <input
          type="number"
          min={1}
          step={1}
          value={reps || ''}
          onChange={e => onRepsChange(parseInt(e.target.value) || 0)}
          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
          placeholder="reps"
        />
      </td>
      <td className="py-2 pr-2">
        <input
          type="number"
          min={5}
          max={10}
          step={0.5}
          value={rpe ?? ''}
          onChange={e => {
            const v = parseFloat(e.target.value);
            onRpeChange(isNaN(v) ? undefined : v);
          }}
          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
          placeholder="RPE"
        />
      </td>
      <td className="py-2 pr-2 text-sm text-gray-600">
        {e1rm ? formatWeight(e1rm.e1rm, unit) : '—'}
      </td>
      <td className="py-2">
        <button
          type="button"
          onClick={onRemove}
          className="text-red-400 hover:text-red-600 text-sm"
          aria-label={`Remove set ${index + 1}`}
        >
          ×
        </button>
      </td>
    </tr>
  );
}
