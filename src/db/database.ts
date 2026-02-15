import Dexie, { type EntityTable } from 'dexie';
import type { Session, PRRecord, AppSettings } from '../schemas';

const db = new Dexie('TrainingLogV2') as Dexie & {
  sessions: EntityTable<Session, 'id'>;
  prRecords: EntityTable<PRRecord, 'id'>;
  settings: EntityTable<AppSettings & { key: string }, 'key'>;
};

db.version(1).stores({
  sessions: 'id, date, block, week, phase',
  prRecords: 'id, exerciseName, sessionDate, type',
  settings: 'key',
});

export { db };
