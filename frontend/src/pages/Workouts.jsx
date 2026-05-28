import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Plus, Dumbbell, ChevronRight, Trash2, X } from 'lucide-react';

function CreateModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', date: new Date().toISOString().split('T')[0], duration_minutes: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/workouts', {
        ...form,
        duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : null,
      });
      onCreate(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center overflow-y-auto">
      <div className="card w-full max-w-md animate-slide-up my-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-200">New Workout</h2>
          <button onClick={onClose} className="text-steel-500 hover:text-slate-200 transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Workout Name *</label>
            <input className="input" placeholder="e.g. Push Day A" value={form.name} onChange={set('name')} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date</label>
              <input className="input" type="date" value={form.date} onChange={set('date')} />
            </div>
            <div>
              <label className="label">Duration (min)</label>
              <input className="input" type="number" placeholder="60" value={form.duration_minutes} onChange={set('duration_minutes')} min="1" />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={2} placeholder="How was the session?" value={form.notes} onChange={set('notes')} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-ghost flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Creating...' : 'Create Workout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.get('/workouts').then(r => setWorkouts(r.data)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!confirm('Delete this workout and all its exercises?')) return;
    await api.delete(`/workouts/${id}`);
    setWorkouts(ws => ws.filter(w => w.id !== id));
  };

  return (
    <div className="max-w-3xl animate-slide-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-slate-100 tracking-wider uppercase">Workouts</h1>
          <p className="text-steel-500 text-sm mt-1">{workouts.length} session{workouts.length !== 1 ? 's' : ''} logged</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={14} />
          New Workout
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[0,1,2,3].map(i => <div key={i} className="card h-20 animate-pulse bg-carbon-700" />)}</div>
      ) : workouts.length === 0 ? (
        <div className="card text-center py-20">
          <Dumbbell size={36} className="text-steel-600 mx-auto mb-3" />
          <p className="text-steel-400 mb-5">No workouts yet. Log your first session!</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>Create Workout</button>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map(w => (
            <Link
              key={w.id}
              to={`/workouts/${w.id}`}
              className="card flex items-center justify-between hover:border-carbon-600 hover:bg-carbon-700/50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-volt-400/10 border border-volt-400/20 flex items-center justify-center shrink-0">
                  <Dumbbell size={16} className="text-volt-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-200 group-hover:text-white">{w.name}</p>
                  <p className="text-xs text-steel-500 mt-0.5">
                    {new Date(w.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {w.duration_minutes && <span className="ml-2">· {w.duration_minutes} min</span>}
                    <span className="ml-2">· {w.exercise_count} exercises</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleDelete(w.id, e)}
                  className="p-1.5 text-steel-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
                <ChevronRight size={16} className="text-steel-600 group-hover:text-volt-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <CreateModal
          onClose={() => setShowModal(false)}
          onCreate={(w) => { setWorkouts(ws => [w, ...ws]); setShowModal(false); }}
        />
      )}
    </div>
  );
}
