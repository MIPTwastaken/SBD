import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useE1RMTrends } from '../../hooks/useDashboardMetrics';
import { useSettingsStore } from '../../stores';
import { kgToDisplay } from '../../utils/units';
import { formatDateShort } from '../../utils/dates';

const LIFT_COLORS: Record<string, string> = {
  squat: '#2563eb',
  bench: '#dc2626',
  deadlift: '#16a34a',
  'overhead press': '#9333ea',
};

export function E1rmChart() {
  const trends = useE1RMTrends();
  const unit = useSettingsStore(s => s.settings.weightUnit);

  const liftNames = Object.keys(trends);
  if (liftNames.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <h2 className="font-semibold text-sm text-gray-700 mb-2">e1RM Trends</h2>
        <p className="text-sm text-gray-400">
          Log sessions with RPE or enough reps to see e1RM trends.
        </p>
      </div>
    );
  }

  // Build combined data points for Recharts
  // Each data point has { date, squat?, bench?, deadlift?, ... }
  const dateMap: Record<string, Record<string, number>> = {};
  for (const [lift, points] of Object.entries(trends)) {
    for (const p of points) {
      const dateKey = p.date.slice(0, 10);
      if (!dateMap[dateKey]) dateMap[dateKey] = {};
      const converted = kgToDisplay(p.e1rm, unit);
      // Keep max if multiple entries on same date
      if (!dateMap[dateKey][lift] || converted > dateMap[dateKey][lift]) {
        dateMap[dateKey][lift] = converted;
      }
    }
  }

  const data = Object.entries(dateMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, lifts]) => ({ date, ...lifts }));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <h2 className="font-semibold text-sm text-gray-700 mb-3">e1RM Trends</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tickFormatter={d => formatDateShort(d)}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            label={{
              value: unit,
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 11 },
            }}
          />
          <Tooltip
            formatter={(value: number | undefined) => value != null ? [`${value} ${unit}`] : []}
            labelFormatter={d => formatDateShort(d as string)}
          />
          <Legend />
          {liftNames.map(lift => (
            <Line
              key={lift}
              type="monotone"
              dataKey={lift}
              stroke={LIFT_COLORS[lift] || '#6b7280'}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
              name={lift.charAt(0).toUpperCase() + lift.slice(1)}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
