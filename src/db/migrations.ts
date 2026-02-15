import type { ExportData } from '../schemas';

type MigrationFn = (data: ExportData) => ExportData;

const migrations: Record<number, MigrationFn> = {
  // Example: when schema v2 is introduced:
  // 2: (data) => {
  //   // Transform v1 data to v2 format
  //   return { ...data, schemaVersion: 2 };
  // },
};

export const CURRENT_SCHEMA_VERSION = 1;

export function migrateData(data: ExportData): ExportData {
  let current = data;
  let version = current.schemaVersion;

  while (version < CURRENT_SCHEMA_VERSION) {
    const nextVersion = version + 1;
    const migrator = migrations[nextVersion];
    if (!migrator) {
      throw new Error(`No migration found for version ${version} → ${nextVersion}`);
    }
    current = migrator(current);
    version = nextVersion;
  }

  return current;
}
