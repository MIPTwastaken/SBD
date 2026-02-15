interface WellnessPanelProps {
  bodyweight?: number;
  sleep?: number;
  sleepQuality?: number;
  stress?: number;
  mood?: number;
  readiness?: number;
  onBodyweightChange: (v: number | undefined) => void;
  onSleepChange: (v: number | undefined) => void;
  onSleepQualityChange: (v: number | undefined) => void;
  onStressChange: (v: number | undefined) => void;
  onMoodChange: (v: number | undefined) => void;
  onReadinessChange: (v: number | undefined) => void;
}

function parseOptionalNumber(val: string): number | undefined {
  const n = parseFloat(val);
  return isNaN(n) ? undefined : n;
}

function parseOptionalInt(val: string): number | undefined {
  const n = parseInt(val, 10);
  return isNaN(n) ? undefined : n;
}

export function WellnessPanel({
  bodyweight,
  sleep,
  sleepQuality,
  stress,
  mood,
  readiness,
  onBodyweightChange,
  onSleepChange,
  onSleepQualityChange,
  onStressChange,
  onMoodChange,
  onReadinessChange,
}: WellnessPanelProps) {
  return (
    <details className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <summary className="font-medium text-sm text-gray-700 cursor-pointer">
        Wellness & Readiness
      </summary>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Bodyweight (kg)</label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={bodyweight ?? ''}
            onChange={e => onBodyweightChange(parseOptionalNumber(e.target.value))}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Sleep (hours)</label>
          <input
            type="number"
            min={0}
            max={24}
            step={0.5}
            value={sleep ?? ''}
            onChange={e => onSleepChange(parseOptionalNumber(e.target.value))}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Sleep quality (1-5)</label>
          <input
            type="number"
            min={1}
            max={5}
            step={1}
            value={sleepQuality ?? ''}
            onChange={e => onSleepQualityChange(parseOptionalInt(e.target.value))}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Stress (1-5)</label>
          <input
            type="number"
            min={1}
            max={5}
            step={1}
            value={stress ?? ''}
            onChange={e => onStressChange(parseOptionalInt(e.target.value))}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Mood (1-5)</label>
          <input
            type="number"
            min={1}
            max={5}
            step={1}
            value={mood ?? ''}
            onChange={e => onMoodChange(parseOptionalInt(e.target.value))}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Readiness (1-5)</label>
          <input
            type="number"
            min={1}
            max={5}
            step={1}
            value={readiness ?? ''}
            onChange={e => onReadinessChange(parseOptionalInt(e.target.value))}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </div>
      </div>
    </details>
  );
}
