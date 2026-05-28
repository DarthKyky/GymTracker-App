import { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { TrendingUp, ChevronDown } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-carbon-800 border border-carbon-600 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-steel-500 mb-1">{label}</p>
      <p className="text-volt-400 font-semibold font-mono">{payload[0].value} kg</p>
      {payload[0].payload.sets && (
        <p className="text-xs text-steel-500 mt-0.5">{payload[0].payload.sets} × {payload[0].payload.reps}</p>
      )}
    </div>
  );
};

export default function Progress() {
  const [names, setNames] = useState([]);
  const [selected, setSelected] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/exercises/names').then(r => {
      setNames(r.data);
      if (r.data.length > 0) setSelected(r.data[0]);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    api.get(`/exercises/progress?name=${encodeURIComponent(selected)}`)
      .then(r => {
        setData(r.data.map(d => ({
          date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          weight: parseFloat(d.weight_kg),
          sets: d.sets,
          reps: d.reps,
        })));
      })
      .finally(() => setLoading(false));
  }, [selected]);

  const maxWeight = data.length ? Math.max(...data.map(d => d.weight)) : 0;
  const improvement = data.length >= 2
    ? (((data[data.length - 1].weight - data[0].weight) / data[0].weight) * 100).toFixed(1)
    : null;

  return (
    <div className="max-w-3xl animate-slide-up">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-slate-100 tracking-wider uppercase">Progress</h1>
        <p className="text-steel-500 text-sm mt-1">Weight progression over time</p>
      </div>

      {names.length === 0 ? (
        <div className="card text-center py-20">
          <TrendingUp size={32} className="text-steel-600 mx-auto mb-3" />
          <p className="text-steel-400 mb-2">No exercise data yet.</p>
          <p className="text-steel-600 text-sm">Log some workouts with weight to see your progress charts.</p>
        </div>
      ) : (
        <>
          {/* Exercise selector */}
          <div className="mb-6">
            <label className="label">Exercise</label>
            <div className="relative max-w-xs">
              <select
                className="input appearance-none pr-8 cursor-pointer"
                value={selected}
                onChange={e => setSelected(e.target.value)}
              >
                {names.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-500 pointer-events-none" />
            </div>
          </div>

          {/* Stats row */}
          {data.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="stat-card">
                <span className="text-xs text-steel-500 uppercase tracking-wider">Sessions</span>
                <span className="font-display text-3xl text-slate-100">{data.length}</span>
              </div>
              <div className="stat-card">
                <span className="text-xs text-steel-500 uppercase tracking-wider">Best Weight</span>
                <span className="font-display text-3xl text-volt-400">{maxWeight} kg</span>
              </div>
              <div className="stat-card">
                <span className="text-xs text-steel-500 uppercase tracking-wider">Progress</span>
                <span className={`font-display text-3xl ${improvement > 0 ? 'text-emerald-400' : improvement < 0 ? 'text-red-400' : 'text-slate-100'}`}>
                  {improvement !== null ? `${improvement > 0 ? '+' : ''}${improvement}%` : '—'}
                </span>
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="card">
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-7 h-7 border-2 border-volt-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : data.length < 2 ? (
              <div className="h-64 flex items-center justify-center text-center">
                <div>
                  <TrendingUp size={28} className="text-steel-600 mx-auto mb-2" />
                  <p className="text-steel-500 text-sm">Need at least 2 sessions to show a trend.</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid stroke="#242429" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `${v}kg`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3d3d46', strokeWidth: 1 }} />
                  <ReferenceLine y={maxWeight} stroke="#d4ff00" strokeDasharray="4 4" strokeOpacity={0.3} />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#d4ff00"
                    strokeWidth={2}
                    dot={{ fill: '#d4ff00', r: 4, strokeWidth: 0 }}
                    activeDot={{ fill: '#d4ff00', r: 6, strokeWidth: 2, stroke: '#0a0a0b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}
