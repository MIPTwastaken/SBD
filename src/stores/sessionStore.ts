import { create } from 'zustand';
import type { Session, PRRecord } from '../schemas';
import { db } from '../db/database';
import { detectPRs, candidatesToRecords } from '../calculations/pr';

interface SessionState {
  sessions: Session[];
  prRecords: PRRecord[];
  loaded: boolean;
  loadSessions: () => Promise<void>;
  addSession: (session: Session) => Promise<PRRecord[]>;
  updateSession: (session: Session) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  duplicateSession: (id: string) => Session | null;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  prRecords: [],
  loaded: false,

  loadSessions: async () => {
    const sessions = await db.sessions.orderBy('date').reverse().toArray();
    const prRecords = await db.prRecords.toArray();
    set({ sessions, prRecords, loaded: true });
  },

  addSession: async (session) => {
    const now = new Date().toISOString();
    const sessionToSave: Session = {
      ...session,
      createdAt: now,
      updatedAt: now,
    };

    // Detect PRs
    const existingPRs = get().prRecords;
    const prCandidates = detectPRs(
      session.exercises,
      existingPRs,
    );
    const newPRRecords = candidatesToRecords(
      prCandidates,
      session.id,
      session.date,
    );

    // Save to DB
    await db.transaction('rw', db.sessions, db.prRecords, async () => {
      await db.sessions.add(sessionToSave);

      // Update existing PRs and add new ones
      for (const pr of newPRRecords) {
        // Remove old PR of same type/exercise/reps if exists
        const existing = existingPRs.find(
          e =>
            e.exerciseName === pr.exerciseName &&
            e.type === pr.type &&
            e.reps === pr.reps
        );
        if (existing) {
          await db.prRecords.delete(existing.id);
        }
        await db.prRecords.add(pr);
      }
    });

    // Update local state
    const allSessions = await db.sessions.orderBy('date').reverse().toArray();
    const allPRs = await db.prRecords.toArray();
    set({ sessions: allSessions, prRecords: allPRs });

    return newPRRecords;
  },

  updateSession: async (session) => {
    const updated = { ...session, updatedAt: new Date().toISOString() };
    await db.sessions.put(updated);
    const sessions = await db.sessions.orderBy('date').reverse().toArray();
    set({ sessions });
  },

  deleteSession: async (id) => {
    await db.sessions.delete(id);
    const sessions = await db.sessions.orderBy('date').reverse().toArray();
    set({ sessions });
  },

  duplicateSession: (id) => {
    const source = get().sessions.find(s => s.id === id);
    if (!source) return null;

    return {
      ...source,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      createdAt: '',
      updatedAt: '',
      notes: '',
      // Keep exercises and sets but regenerate IDs
      exercises: source.exercises.map(ex => ({
        ...ex,
        id: crypto.randomUUID(),
        sets: ex.sets.map(s => ({
          ...s,
          id: crypto.randomUUID(),
        })),
      })),
    };
  },
}));
