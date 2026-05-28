import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { ChevronRight, Dumbbell, Search } from 'lucide-react';

export default function History() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/workouts').then(r => setWorkouts(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = workouts.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  // Group by month
  const grouped = filtered.reduce((acc, w) => {
    const key = new Date(w.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(w);
    return acc;
  }, {});

  return (
    <div className="max-w-2xl animate-slide-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-slate-100 tracking-wider uppercase">History</h1>
          <p className="text-steel-500 text-sm mt-1">{workouts.length} workout{workouts.length !== 1 ? 's' : ''} total</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-steel-500" />
        <input
          className="input pl-9"
          placeholder="Search workouts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-3">{[0,1,2,3].map(i => <div key={i} className="card h-16 animate-pulse bg-carbon-700" />)}</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="card text-center py-16">
          <Dumbbell size={32} className="text-steel-600 mx-auto mb-3" />
          <p className="text-steel-400">{search ? 'No matching workouts found.' : 'No workout history yet.'}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([month, ws]) => (
            <div key={month}>
              <h2 className="text-xs font-semibold text-steel-500 uppercase tracking-widest mb-3 font-mono">{month}</h2>
              <div className="space-y-2.5">
                {ws.map(w => (
                  <Link
                    key={w.id}
                    to={`/workouts/${w.id}`}
                    className="card flex items-center justify-between hover:border-carbon-600 hover:bg-carbon-700/50 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-right w-10 shrink-0">
                        <p className="text-xs text-steel-500">
                          {new Date(w.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        <p className="text-sm font-semibold text-slate-300">
                          {new Date(w.date).getDate()}
                        </p>
                      </div>
                      <div className="w-px h-10 bg-carbon-600" />
                      <div>
                        <p className="font-medium text-slate-200 group-hover:text-white text-sm">{w.name}</p>
                        <p className="text-xs text-steel-500">
                          {w.exercise_count} exercises
                          {w.duration_minutes && ` · ${w.duration_minutes} min`}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-steel-600 group-hover:text-volt-400 transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
