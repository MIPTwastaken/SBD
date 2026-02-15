import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useSessionStore } from '../../stores';
import { tonnageByTier } from '../../calculations';
import { formatDateShort } from '../../utils/dates';

export function VolumeChart() {
  const sessions = useSessionStore(s => s.sessions);

  const data = useMemo(() => {
    // Take last 20 sessions, chronological order
    const recent = [...sessions]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-20);

    return recent.map(session => {
      const tiers = tonnageByTier(session);
      return {
        date: session.date.slice(0, 10),
        T1: Math.round(tiers.T1),
        T2: Math.round(tiers.T2),
        T3: Math.round(tiers.T3),
      };
    });
  }, [sessions]);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <h2 className="font-semibold text-sm text-gray-700 mb-2">Volume by Tier</h2>
        <p className="text-sm text-gray-400">Log sessions to see volume trends.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <h2 className="font-semibold text-sm text-gray-700 mb-3">Volume by Tier (Tonnage)</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tickFormatter={d => formatDateShort(d)}
            tick={{ fontSize: 11 }}
          />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip labelFormatter={d => formatDateShort(d as string)} />
          <Legend />
          <Bar dataKey="T1" stackId="a" fill="#2563eb" />
          <Bar dataKey="T2" stackId="a" fill="#60a5fa" />
          <Bar dataKey="T3" stackId="a" fill="#bfdbfe" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
