import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function AppShell() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="max-w-2xl mx-auto px-4 py-6">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
