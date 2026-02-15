import { create } from 'zustand';
import type { AppSettings } from '../schemas';
import { DEFAULT_SETTINGS } from '../schemas';
import { db } from '../db/database';

interface SettingsState {
  settings: AppSettings;
  loaded: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,

  loadSettings: async () => {
    const row = await db.settings.get('app');
    if (row) {
      const { ...settings } = row;
      delete (settings as Record<string, unknown>)['key'];
      set({ settings: settings as unknown as AppSettings, loaded: true });
    } else {
      // Initialize with defaults
      await db.settings.put({ key: 'app', ...DEFAULT_SETTINGS });
      set({ settings: DEFAULT_SETTINGS, loaded: true });
    }
  },

  updateSettings: async (patch) => {
    const current = get().settings;
    const updated = { ...current, ...patch };
    await db.settings.put({ key: 'app', ...updated });
    set({ settings: updated });
  },
}));
