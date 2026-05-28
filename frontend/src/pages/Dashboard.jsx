import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Dumbbell, Flame, Calendar, ChevronRight, Plus } from 'lucide-react';

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-steel-500 font-medium">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon size={14} />
        </div>
      </div>
      <span className="font-display text-4xl text-slate-100 tracking-wider">{value ?? '—'}</span>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-4xl animate-slide-up">
      {/* Header */}
      <div className="mb-8">
        <p className="text-steel-500 text-sm mb-1">{greeting}</p>
        <h1 className="font-display text-5xl text-slate-100 tracking-wider uppercase">
          {user?.username}
        </h1>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[0,1,2].map(i => <div key={i} className="card h-24 animate-pulse bg-carbon-700" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Workouts" value={stats?.total_workouts} icon={Dumbbell} accent="bg-volt-400/10 text-volt-400" />
          <StatCard label="This Week" value={stats?.workouts_this_week} icon={Flame} accent="bg-orange-500/10 text-orange-400" />
          <StatCard label="Total Exercises" value={stats?.total_exercises} icon={Calendar} accent="bg-blue-500/10 text-blue-400" />
        </div>
      )}

      {/* Quick action */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-200">Recent Workouts</h2>
        <Link to="/workouts" className="btn-ghost flex items-center gap-1.5 text-xs">
          <Plus size={12} />
          New Workout
        </Link>
      </div>

      {/* Recent workouts list */}
      {loading ? (
        <div className="space-y-3">
          {[0,1,2].map(i => <div key={i} className="card h-16 animate-pulse bg-carbon-700" />)}
        </div>
      ) : stats?.recent_workouts?.length === 0 ? (
        <div className="card text-center py-16">
          <Dumbbell size={32} className="text-steel-600 mx-auto mb-3" />
          <p className="text-steel-400 mb-4">No workouts yet. Start your journey!</p>
          <Link to="/workouts" className="btn-primary">Log first workout</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {stats?.recent_workouts?.map(w => (
            <Link
              key={w.id}
              to={`/workouts/${w.id}`}
              className="card flex items-center justify-between hover:border-carbon-600 hover:bg-carbon-700/50 transition-all duration-200 group"
            >
              <div>
                <p className="font-medium text-slate-200 group-hover:text-white">{w.name}</p>
                <p className="text-xs text-steel-500 mt-0.5">
                  {new Date(w.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  {w.duration_minutes && <span className="ml-2">· {w.duration_minutes} min</span>}
                  <span className="ml-2">· {w.exercise_count} exercises</span>
                </p>
              </div>
              <ChevronRight size={16} className="text-steel-600 group-hover:text-volt-400 transition-colors" />
            </Link>
          ))}
          <Link to="/history" className="block text-center text-sm text-steel-500 hover:text-volt-400 py-2 transition-colors">
            View full history →
          </Link>
        </div>
      )}
    </div>
  );
}
