import { db } from '../db/database';
import { ExportDataSchema, DEFAULT_SETTINGS } from '../schemas';
import type { ExportData } from '../schemas';
import { migrateData, CURRENT_SCHEMA_VERSION } from '../db/migrations';

/**
 * Export all data from the database to a JSON object.
 */
export async function exportData(): Promise<ExportData> {
  const sessions = await db.sessions.toArray();
  const prRecords = await db.prRecords.toArray();
  const settingsRow = await db.settings.get('app');
  const settings = settingsRow
    ? { ...settingsRow, key: undefined }
    : DEFAULT_SETTINGS;

  // Clean up the key field from settings
  const { ...cleanSettings } = settings;
  delete (cleanSettings as Record<string, unknown>)['key'];

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    settings: cleanSettings as ExportData['settings'],
    sessions,
    prRecords,
  };
}

/**
 * Download the export as a JSON file.
 */
export async function downloadExport(): Promise<void> {
  const data = await exportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `training-log-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export interface ImportValidation {
  valid: boolean;
  errors: string[];
  data?: ExportData;
}

/**
 * Validate and parse imported JSON.
 */
export function validateImport(json: unknown): ImportValidation {
  const result = ExportDataSchema.safeParse(json);

  if (!result.success) {
    return {
      valid: false,
      errors: result.error.issues.map(
        i => `${i.path.join('.')}: ${i.message}`
      ),
    };
  }

  // Migrate if needed
  try {
    const migrated = migrateData(result.data);
    return { valid: true, errors: [], data: migrated };
  } catch (err) {
    return {
      valid: false,
      errors: [`Migration failed: ${err instanceof Error ? err.message : String(err)}`],
    };
  }
}

/**
 * Import data, replacing all existing data.
 */
export async function importData(data: ExportData): Promise<void> {
  await db.transaction('rw', db.sessions, db.prRecords, db.settings, async () => {
    await db.sessions.clear();
    await db.prRecords.clear();
    await db.settings.clear();

    await db.sessions.bulkAdd(data.sessions);
    await db.prRecords.bulkAdd(data.prRecords);
    await db.settings.put({ key: 'app', ...data.settings });
  });
}
