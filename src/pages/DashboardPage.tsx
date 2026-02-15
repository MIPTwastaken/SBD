import { AnchorsCard } from '../components/dashboard/AnchorsCard';
import { E1rmChart } from '../components/dashboard/E1rmChart';
import { FatigueAlerts } from '../components/dashboard/FatigueAlerts';
import { VolumeChart } from '../components/dashboard/VolumeChart';
import { PRBoard } from '../components/dashboard/PRBoard';
import { useSessionStore } from '../stores';

export function DashboardPage() {
  const loaded = useSessionStore(s => s.loaded);
  const sessions = useSessionStore(s => s.sessions);

  if (!loaded) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-lg" />
        <div className="h-64 bg-gray-200 rounded-lg" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-16">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Training Log v2.0</h1>
        <p className="text-gray-500 mb-6">
          Welcome! Log your first session to start tracking progress.
        </p>
        <a
          href="/log"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700"
        >
          Log First Session
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">Dashboard</h1>
      <FatigueAlerts />
      <AnchorsCard />
      <E1rmChart />
      <VolumeChart />
      <PRBoard />
    </div>
  );
}
