import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { LogSessionPage } from './pages/LogSessionPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { useSessionStore, useSettingsStore } from './stores';

export default function App() {
  const loadSessions = useSessionStore(s => s.loadSessions);
  const loadSettings = useSettingsStore(s => s.loadSettings);

  useEffect(() => {
    loadSettings();
    loadSessions();
  }, [loadSettings, loadSessions]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/log" element={<LogSessionPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
