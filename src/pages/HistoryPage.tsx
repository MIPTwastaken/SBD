import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore, useSettingsStore } from '../stores';
import { sessionTonnage } from '../calculations';
import { formatWeight } from '../utils/units';
import { formatDate } from '../utils/dates';

export function HistoryPage() {
  const sessions = useSessionStore(s => s.sessions);
  const deleteSession = useSessionStore(s => s.deleteSession);
  const duplicateSession = useSessionStore(s => s.duplicateSession);
  const addSession = useSessionStore(s => s.addSession);
  const unit = useSettingsStore(s => s.settings.weightUnit);
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (sessions.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-4">History</h1>
        <p className="text-gray-500 text-center py-8">No sessions logged yet.</p>
      </div>
    );
  }

  const handleDuplicate = async (id: string) => {
    const template = duplicateSession(id);
    if (template) {
      await addSession(template);
      navigate('/log');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this session? This cannot be undone.')) {
      await deleteSession(id);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">History</h1>
      <div className="space-y-2">
        {sessions.map(session => (
          <div
            key={session.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setExpanded(expanded === session.id ? null : session.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
            >
              <div>
                <div className="font-medium text-sm">{formatDate(session.date)}</div>
                <div className="text-xs text-gray-500">
                  {session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}
                  {session.duration ? ` · ${session.duration} min` : ''}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {formatWeight(sessionTonnage(session), unit)}
                </div>
                <div className="text-xs text-gray-500">tonnage</div>
              </div>
            </button>

            {expanded === session.id && (
              <div className="border-t border-gray-100 p-4">
                {session.exercises.map(ex => (
                  <div key={ex.id} className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                        {ex.tier}
                      </span>
                      <span className="text-sm font-medium">{ex.name}</span>
                      {ex.variation && (
                        <span className="text-xs text-gray-500">({ex.variation})</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 ml-8">
                      {ex.sets.map((set, i) => (
                        <span key={set.id}>
                          {i > 0 && ' · '}
                          {formatWeight(set.weight, unit)} x {set.reps}
                          {set.rpe !== undefined && ` @${set.rpe}`}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {session.notes && (
                  <p className="text-xs text-gray-500 mt-2 italic">{session.notes}</p>
                )}
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => handleDuplicate(session.id)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(session.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
