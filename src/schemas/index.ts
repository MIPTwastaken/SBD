import { z } from 'zod/v4';

// === Enums ===
export const TierSchema = z.enum(['T1', 'T2', 'T3']);
export type Tier = z.infer<typeof TierSchema>;

export const PainTypeSchema = z.enum(['sharp', 'dull', 'nerve', 'other']);
export type PainType = z.infer<typeof PainTypeSchema>;

export const SexSchema = z.enum(['male', 'female']);
export type Sex = z.infer<typeof SexSchema>;

export const WeightUnitSchema = z.enum(['kg', 'lb']);
export type WeightUnit = z.infer<typeof WeightUnitSchema>;

export const PRTypeSchema = z.enum(['e1rm', 'weight_at_reps', 'reps_at_weight']);
export type PRType = z.infer<typeof PRTypeSchema>;

// === Pain Entry ===
export const PainEntrySchema = z.object({
  location: z.string().min(1),
  score: z.number().min(0).max(10),
  type: PainTypeSchema,
  notes: z.string().optional(),
});
export type PainEntry = z.infer<typeof PainEntrySchema>;

// === Training Set ===
export const TrainingSetSchema = z.object({
  id: z.string(),
  weight: z.number().positive(),
  reps: z.number().int().min(1),
  rpe: z.number().min(5).max(10).step(0.5).optional(),
});
export type TrainingSet = z.infer<typeof TrainingSetSchema>;

// === Exercise ===
export const ExerciseSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  tier: TierSchema,
  variation: z.string().optional(),
  sets: z.array(TrainingSetSchema).min(1),
  techNotes: z.string().optional(),
  isMainLift: z.boolean().optional(),
});
export type Exercise = z.infer<typeof ExerciseSchema>;

// === Session ===
export const SessionSchema = z.object({
  id: z.string(),
  date: z.string(),
  duration: z.number().positive().optional(),
  bodyweight: z.number().positive().optional(),
  sleep: z.number().min(0).max(24).optional(),
  sleepQuality: z.number().int().min(1).max(5).optional(),
  stress: z.number().int().min(1).max(5).optional(),
  mood: z.number().int().min(1).max(5).optional(),
  readiness: z.number().int().min(1).max(5).optional(),
  pain: z.array(PainEntrySchema).optional(),
  restrictions: z.string().optional(),
  block: z.string().optional(),
  week: z.string().optional(),
  phase: z.string().optional(),
  exercises: z.array(ExerciseSchema).min(1),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Session = z.infer<typeof SessionSchema>;

// === PR Record ===
export const PRRecordSchema = z.object({
  id: z.string(),
  exerciseName: z.string(),
  type: PRTypeSchema,
  value: z.number(),
  reps: z.number().int().optional(),
  weight: z.number().optional(),
  sessionId: z.string(),
  sessionDate: z.string(),
  previousValue: z.number().optional(),
});
export type PRRecord = z.infer<typeof PRRecordSchema>;

// === Settings ===
export const AppSettingsSchema = z.object({
  weightUnit: WeightUnitSchema,
  sex: SexSchema,
  fatigueDropThreshold: z.number().min(0).max(1),
  rpeStreakThreshold: z.number().int().min(1),
  schemaVersion: z.number().int(),
});
export type AppSettings = z.infer<typeof AppSettingsSchema>;

export const DEFAULT_SETTINGS: AppSettings = {
  weightUnit: 'kg',
  sex: 'male',
  fatigueDropThreshold: 0.05,
  rpeStreakThreshold: 2,
  schemaVersion: 1,
};

// === Export Format ===
export const ExportDataSchema = z.object({
  schemaVersion: z.number().int(),
  exportedAt: z.string(),
  settings: AppSettingsSchema,
  sessions: z.array(SessionSchema),
  prRecords: z.array(PRRecordSchema),
});
export type ExportData = z.infer<typeof ExportDataSchema>;
