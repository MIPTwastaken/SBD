import { useState } from 'react';
import { useSettingsStore } from '../stores';
import { downloadExport, validateImport, importData } from '../utils/export-import';
import type { WeightUnit, Sex } from '../schemas';

export function SettingsPage() {
  const { settings, updateSettings } = useSettingsStore();
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      await downloadExport();
    } catch {
      alert('Export failed. Please try again.');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const validation = validateImport(json);

      if (!validation.valid) {
        setImportStatus(`Invalid: ${validation.errors.join('; ')}`);
        return;
      }

      if (!confirm('This will replace all existing data. Continue?')) return;

      await importData(validation.data!);
      setImportStatus('Import successful! Reload to see changes.');
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      setImportStatus('Failed to parse file. Ensure it is valid JSON.');
    }

    // Reset file input
    e.target.value = '';
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">Settings</h1>

      {/* Units */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <h2 className="font-semibold text-sm text-gray-700 mb-3">Units</h2>
        <div className="flex gap-2">
          {(['kg', 'lb'] as WeightUnit[]).map(u => (
            <button
              key={u}
              type="button"
              onClick={() => updateSettings({ weightUnit: u })}
              className={`px-4 py-2 rounded text-sm font-medium ${
                settings.weightUnit === u
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {u.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Sex (for Wilks/DOTS) */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <h2 className="font-semibold text-sm text-gray-700 mb-3">
          Sex (for Wilks/DOTS)
        </h2>
        <div className="flex gap-2">
          {(['male', 'female'] as Sex[]).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => updateSettings({ sex: s })}
              className={`px-4 py-2 rounded text-sm font-medium capitalize ${
                settings.sex === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Fatigue Thresholds */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <h2 className="font-semibold text-sm text-gray-700 mb-3">Fatigue Thresholds</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              e1RM drop threshold (%)
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={Math.round(settings.fatigueDropThreshold * 100)}
              onChange={e =>
                updateSettings({
                  fatigueDropThreshold: parseInt(e.target.value) / 100,
                })
              }
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              RPE streak sessions
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={settings.rpeStreakThreshold}
              onChange={e =>
                updateSettings({
                  rpeStreakThreshold: parseInt(e.target.value) || 2,
                })
              }
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <h2 className="font-semibold text-sm text-gray-700 mb-3">Data Management</h2>
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleExport}
            className="w-full py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
          >
            Export to JSON
          </button>
          <div>
            <label className="block w-full py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 text-center cursor-pointer">
              Import from JSON
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
          {importStatus && (
            <p className={`text-xs ${importStatus.startsWith('Invalid') || importStatus.startsWith('Failed') ? 'text-red-600' : 'text-green-600'}`}>
              {importStatus}
            </p>
          )}
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <h2 className="font-semibold text-sm text-gray-700 mb-2">About</h2>
        <p className="text-xs text-gray-500">
          Training Log v2.0 · Schema v{settings.schemaVersion}
        </p>
      </div>
    </div>
  );
}
