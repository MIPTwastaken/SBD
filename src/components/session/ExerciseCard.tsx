import { SetRow } from './SetRow';
import type { Tier } from '../../schemas';

interface SetData {
  id: string;
  weight: number;
  reps: number;
  rpe?: number;
}

interface ExerciseCardProps {
  name: string;
  tier: Tier;
  variation: string;
  sets: SetData[];
  techNotes: string;
  isMainLift: boolean;
  exerciseNames: string[];
  onNameChange: (v: string) => void;
  onTierChange: (v: Tier) => void;
  onVariationChange: (v: string) => void;
  onTechNotesChange: (v: string) => void;
  onMainLiftToggle: () => void;
  onSetChange: (setIndex: number, field: string, value: number | undefined) => void;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onRemoveExercise: () => void;
}

const tiers: Tier[] = ['T1', 'T2', 'T3'];

export function ExerciseCard({
  name,
  tier,
  variation,
  sets,
  techNotes,
  isMainLift,
  exerciseNames,
  onNameChange,
  onTierChange,
  onVariationChange,
  onTechNotesChange,
  onMainLiftToggle,
  onSetChange,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
}: ExerciseCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1">
          <input
            type="text"
            value={name}
            onChange={e => onNameChange(e.target.value)}
            list="exercise-names"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium"
            placeholder="Exercise name (e.g., Squat)"
          />
          <datalist id="exercise-names">
            {exerciseNames.map(n => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </div>
        <button
          type="button"
          onClick={onRemoveExercise}
          className="text-red-400 hover:text-red-600 text-sm px-2 py-2"
          aria-label="Remove exercise"
        >
          Remove
        </button>
      </div>

      {/* Tier + Variation */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex gap-1">
          {tiers.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => onTierChange(t)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                tier === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={variation}
          onChange={e => onVariationChange(e.target.value)}
          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
          placeholder="Variation (e.g., paused)"
        />
        <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
          <input
            type="checkbox"
            checked={isMainLift}
            onChange={onMainLiftToggle}
            className="rounded"
          />
          Main lift
        </label>
      </div>

      {/* Sets Table */}
      <table className="w-full mb-3">
        <thead>
          <tr className="text-xs text-gray-500 border-b border-gray-200">
            <th className="text-left py-1 pr-2">#</th>
            <th className="text-left py-1 pr-2">Weight</th>
            <th className="text-left py-1 pr-2">Reps</th>
            <th className="text-left py-1 pr-2">RPE</th>
            <th className="text-left py-1 pr-2">e1RM</th>
            <th className="py-1"></th>
          </tr>
        </thead>
        <tbody>
          {sets.map((set, i) => (
            <SetRow
              key={set.id}
              index={i}
              weight={set.weight}
              reps={set.reps}
              rpe={set.rpe}
              onWeightChange={v => onSetChange(i, 'weight', v)}
              onRepsChange={v => onSetChange(i, 'reps', v)}
              onRpeChange={v => onSetChange(i, 'rpe', v)}
              onRemove={() => onRemoveSet(i)}
            />
          ))}
        </tbody>
      </table>

      <button
        type="button"
        onClick={onAddSet}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        + Add Set
      </button>

      {/* Tech Notes */}
      <details className="mt-3">
        <summary className="text-xs text-gray-500 cursor-pointer">
          Tech notes
        </summary>
        <textarea
          value={techNotes}
          onChange={e => onTechNotesChange(e.target.value)}
          className="mt-1 w-full px-2 py-1 border border-gray-300 rounded text-sm"
          rows={2}
          placeholder="Technical notes..."
        />
      </details>
    </div>
  );
}
