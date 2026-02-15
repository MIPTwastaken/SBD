import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExerciseCard } from './ExerciseCard';
import { WellnessPanel } from './WellnessPanel';
import { useSessionStore, useSettingsStore } from '../../stores';
import { useExerciseAutocomplete } from '../../hooks/useExerciseAutocomplete';
import { isMainLift as detectMainLift } from '../../utils/normalization';
import { parseWeightToKg } from '../../utils/units';
import type { Session, Exercise, Tier } from '../../schemas';

interface SetDraft {
  id: string;
  weight: number;
  reps: number;
  rpe?: number;
}

interface ExerciseDraft {
  id: string;
  name: string;
  tier: Tier;
  variation: string;
  sets: SetDraft[];
  techNotes: string;
  isMainLift: boolean;
}

function newSet(): SetDraft {
  return { id: crypto.randomUUID(), weight: 0, reps: 0 };
}

function newExercise(): ExerciseDraft {
  return {
    id: crypto.randomUUID(),
    name: '',
    tier: 'T1',
    variation: '',
    sets: [newSet()],
    techNotes: '',
    isMainLift: false,
  };
}

interface SessionFormProps {
  initialSession?: Session;
}

export function SessionForm({ initialSession }: SessionFormProps) {
  const navigate = useNavigate();
  const addSession = useSessionStore(s => s.addSession);
  const updateSession = useSessionStore(s => s.updateSession);
  const unit = useSettingsStore(s => s.settings.weightUnit);
  const exerciseNames = useExerciseAutocomplete();

  const isEditing = !!initialSession;

  // Session fields
  const [date, setDate] = useState(
    initialSession?.date?.slice(0, 16) ||
    new Date().toISOString().slice(0, 16)
  );
  const [duration, setDuration] = useState<number | undefined>(initialSession?.duration);
  const [bodyweight, setBodyweight] = useState<number | undefined>(initialSession?.bodyweight);
  const [sleep, setSleep] = useState<number | undefined>(initialSession?.sleep);
  const [sleepQuality, setSleepQuality] = useState<number | undefined>(initialSession?.sleepQuality);
  const [stress, setStress] = useState<number | undefined>(initialSession?.stress);
  const [mood, setMood] = useState<number | undefined>(initialSession?.mood);
  const [readiness, setReadiness] = useState<number | undefined>(initialSession?.readiness);
  const [block, setBlock] = useState(initialSession?.block || '');
  const [week, setWeek] = useState(initialSession?.week || '');
  const [phase, setPhase] = useState(initialSession?.phase || '');
  const [notes, setNotes] = useState(initialSession?.notes || '');

  // Exercises
  const [exercises, setExercises] = useState<ExerciseDraft[]>(() => {
    if (initialSession?.exercises) {
      return initialSession.exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        tier: ex.tier,
        variation: ex.variation || '',
        sets: ex.sets.map(s => ({
          id: s.id,
          weight: s.weight,
          reps: s.reps,
          rpe: s.rpe,
        })),
        techNotes: ex.techNotes || '',
        isMainLift: ex.isMainLift ?? detectMainLift(ex.name),
      }));
    }
    return [newExercise()];
  });

  const [saving, setSaving] = useState(false);
  const [prMessage, setPrMessage] = useState<string | null>(null);

  const handleAddExercise = useCallback(() => {
    setExercises(prev => [...prev, newExercise()]);
  }, []);

  const handleRemoveExercise = useCallback((index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleExerciseField = useCallback(
    (exIndex: number, field: string, value: string | boolean) => {
      setExercises(prev =>
        prev.map((ex, i) => {
          if (i !== exIndex) return ex;
          const updated = { ...ex, [field]: value };
          // Auto-detect main lift when name changes
          if (field === 'name' && typeof value === 'string') {
            updated.isMainLift = detectMainLift(value);
          }
          return updated;
        })
      );
    },
    []
  );

  const handleSetChange = useCallback(
    (exIndex: number, setIndex: number, field: string, value: number | undefined) => {
      setExercises(prev =>
        prev.map((ex, i) => {
          if (i !== exIndex) return ex;
          return {
            ...ex,
            sets: ex.sets.map((s, j) =>
              j === setIndex ? { ...s, [field]: value } : s
            ),
          };
        })
      );
    },
    []
  );

  const handleAddSet = useCallback((exIndex: number) => {
    setExercises(prev =>
      prev.map((ex, i) => {
        if (i !== exIndex) return ex;
        // Pre-fill from last set
        const lastSet = ex.sets[ex.sets.length - 1];
        const ns: SetDraft = {
          id: crypto.randomUUID(),
          weight: lastSet?.weight || 0,
          reps: lastSet?.reps || 0,
          rpe: lastSet?.rpe,
        };
        return { ...ex, sets: [...ex.sets, ns] };
      })
    );
  }, []);

  const handleRemoveSet = useCallback((exIndex: number, setIndex: number) => {
    setExercises(prev =>
      prev.map((ex, i) => {
        if (i !== exIndex) return ex;
        if (ex.sets.length <= 1) return ex; // keep at least one set
        return { ...ex, sets: ex.sets.filter((_, j) => j !== setIndex) };
      })
    );
  }, []);

  const validate = (): string | null => {
    if (!date) return 'Date is required';
    if (exercises.length === 0) return 'Add at least one exercise';
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      if (!ex.name.trim()) return `Exercise ${i + 1}: name is required`;
      for (let j = 0; j < ex.sets.length; j++) {
        const set = ex.sets[j];
        if (set.weight <= 0) return `Exercise ${i + 1}, Set ${j + 1}: weight must be > 0`;
        if (set.reps < 1) return `Exercise ${i + 1}, Set ${j + 1}: reps must be >= 1`;
        if (set.rpe !== undefined && (set.rpe < 5 || set.rpe > 10)) {
          return `Exercise ${i + 1}, Set ${j + 1}: RPE must be 5.0–10.0`;
        }
      }
    }
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      alert(error);
      return;
    }

    setSaving(true);
    try {
      const sessionExercises: Exercise[] = exercises.map(ex => ({
        id: ex.id,
        name: ex.name.trim(),
        tier: ex.tier,
        variation: ex.variation || undefined,
        sets: ex.sets.map(s => ({
          id: s.id,
          weight: parseWeightToKg(s.weight, unit),
          reps: s.reps,
          rpe: s.rpe,
        })),
        techNotes: ex.techNotes || undefined,
        isMainLift: ex.isMainLift || undefined,
      }));

      const session: Session = {
        id: initialSession?.id || crypto.randomUUID(),
        date: new Date(date).toISOString(),
        duration,
        bodyweight: bodyweight ? parseWeightToKg(bodyweight, unit) : undefined,
        sleep,
        sleepQuality,
        stress,
        mood,
        readiness,
        block: block || undefined,
        week: week || undefined,
        phase: phase || undefined,
        exercises: sessionExercises,
        notes: notes || undefined,
        createdAt: initialSession?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isEditing) {
        await updateSession(session);
      } else {
        const newPRs = await addSession(session);
        if (newPRs.length > 0) {
          setPrMessage(
            `New PRs: ${newPRs.map(pr => `${pr.exerciseName} ${pr.type}`).join(', ')}`
          );
          setTimeout(() => setPrMessage(null), 5000);
        }
      }

      navigate('/');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">
        {isEditing ? 'Edit Session' : 'Log Session'}
      </h1>

      {prMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded mb-4 text-sm">
          {prMessage}
        </div>
      )}

      {/* Date + Duration */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Date & Time</label>
          <input
            type="datetime-local"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="w-24">
          <label className="block text-xs text-gray-500 mb-1">Duration (min)</label>
          <input
            type="number"
            min={0}
            value={duration ?? ''}
            onChange={e => setDuration(e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      {/* Wellness */}
      <WellnessPanel
        bodyweight={bodyweight}
        sleep={sleep}
        sleepQuality={sleepQuality}
        stress={stress}
        mood={mood}
        readiness={readiness}
        onBodyweightChange={setBodyweight}
        onSleepChange={setSleep}
        onSleepQualityChange={setSleepQuality}
        onStressChange={setStress}
        onMoodChange={setMood}
        onReadinessChange={setReadiness}
      />

      {/* Periodization */}
      <details className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <summary className="font-medium text-sm text-gray-700 cursor-pointer">
          Periodization
        </summary>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Block</label>
            <input
              type="text"
              value={block}
              onChange={e => setBlock(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Week</label>
            <input
              type="text"
              value={week}
              onChange={e => setWeek(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Phase</label>
            <select
              value={phase}
              onChange={e => setPhase(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="">—</option>
              <option value="hypertrophy">Hypertrophy</option>
              <option value="strength">Strength</option>
              <option value="peaking">Peaking</option>
              <option value="deload">Deload</option>
            </select>
          </div>
        </div>
      </details>

      {/* Exercises */}
      <h2 className="font-semibold text-sm text-gray-700 mb-2">Exercises</h2>
      {exercises.map((ex, i) => (
        <ExerciseCard
          key={ex.id}
          name={ex.name}
          tier={ex.tier}
          variation={ex.variation}
          sets={ex.sets}
          techNotes={ex.techNotes}
          isMainLift={ex.isMainLift}
          exerciseNames={exerciseNames}
          onNameChange={v => handleExerciseField(i, 'name', v)}
          onTierChange={v => handleExerciseField(i, 'tier', v)}
          onVariationChange={v => handleExerciseField(i, 'variation', v)}
          onTechNotesChange={v => handleExerciseField(i, 'techNotes', v)}
          onMainLiftToggle={() => handleExerciseField(i, 'isMainLift', !ex.isMainLift)}
          onSetChange={(si, field, value) => handleSetChange(i, si, field, value)}
          onAddSet={() => handleAddSet(i)}
          onRemoveSet={si => handleRemoveSet(i, si)}
          onRemoveExercise={() => handleRemoveExercise(i)}
        />
      ))}

      <button
        type="button"
        onClick={handleAddExercise}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 text-sm font-medium mb-4"
      >
        + Add Exercise
      </button>

      {/* Session Notes */}
      <div className="mb-4">
        <label className="block text-xs text-gray-500 mb-1">Session Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          rows={3}
          placeholder="How did the session go?"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-2 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : isEditing ? 'Update Session' : 'Save Session'}
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-6 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
