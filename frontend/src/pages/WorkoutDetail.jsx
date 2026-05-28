import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Plus, Trash2, X, Youtube, Pencil, Check } from 'lucide-react';

// ── Set row inside the add/edit form ─────────────────────────────────────────
function SetRow({ index, set, onChange, onRemove, canRemove }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-steel-500 font-mono w-5 text-right shrink-0">{index + 1}</span>
      <input
        className="input text-center w-20"
        type="number"
        min="1"
        placeholder="Reps"
        value={set.reps}
        onChange={e => onChange(index, 'reps', e.target.value)}
      />
      <input
        className="input text-center w-24"
        type="number"
        step="0.5"
        min="0"
        placeholder="kg"
        value={set.weight_kg}
        onChange={e => onChange(index, 'weight_kg', e.target.value)}
      />
      <button
        type="button"
        onClick={() => onRemove(index)}
        disabled={!canRemove}
        className="text-steel-600 hover:text-red-400 transition-colors disabled:opacity-20 p-1"
      >
        <X size={13} />
      </button>
    </div>
  );
}

// ── Add exercise form ─────────────────────────────────────────────────────────
function AddExerciseForm({ workoutId, onAdd }) {
  const empty = { reps: '', weight_kg: '' };
  const [name, setName] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [sets, setSets] = useState([{ ...empty }, { ...empty }, { ...empty }]);
  const [loading, setLoading] = useState(false);

  const updateSet = (i, key, val) => setSets(s => s.map((r, idx) => idx === i ? { ...r, [key]: val } : r));
  const addSet = () => setSets(s => [...s, { ...empty }]);
  const removeSet = (i) => setSets(s => s.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/exercises', {
        workout_id: workoutId,
        name,
        youtube_url: youtubeUrl || null,
        notes: notes || null,
        sets: sets.filter(s => s.reps).map(s => ({
          reps: parseInt(s.reps),
          weight_kg: s.weight_kg ? parseFloat(s.weight_kg) : null,
        })),
      });
      onAdd(data);
      setName(''); setYoutubeUrl(''); setNotes('');
      setSets([{ ...empty }, { ...empty }, { ...empty }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-dashed border-carbon-600 mt-4">
      <p className="text-xs font-semibold text-steel-400 uppercase tracking-widest mb-4">Add Exercise</p>
      <form onSubmit={handleSubmit}>
        <div className="space-y-3 mb-4">
          <div>
            <label className="label">Exercise Name *</label>
            <input className="input" placeholder="e.g. Bench Press" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">YouTube Link</label>
              <input className="input" type="url" placeholder="https://youtube.com/..." value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} />
            </div>
            <div>
              <label className="label">Notes</label>
              <input className="input" placeholder="Form cues, tempo…" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>

          {/* Sets table */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5" />
              <span className="text-xs text-steel-500 uppercase tracking-wider w-20 text-center">Reps</span>
              <span className="text-xs text-steel-500 uppercase tracking-wider w-24 text-center">Weight (kg)</span>
            </div>
            <div className="space-y-2">
              {sets.map((s, i) => (
                <SetRow key={i} index={i} set={s} onChange={updateSet} onRemove={removeSet} canRemove={sets.length > 1} />
              ))}
            </div>
            <button type="button" onClick={addSet} className="mt-2 text-xs text-volt-400 hover:text-volt-500 flex items-center gap-1 transition-colors">
              <Plus size={11} /> Add set
            </button>
          </div>
        </div>

        <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
          <Plus size={13} />
          {loading ? 'Adding…' : 'Add Exercise'}
        </button>
      </form>
    </div>
  );
}

// ── Edit exercise modal ───────────────────────────────────────────────────────
function EditModal({ exercise, onSave, onClose }) {
  const [name, setName] = useState(exercise.name);
  const [youtubeUrl, setYoutubeUrl] = useState(exercise.youtube_url || '');
  const [notes, setNotes] = useState(exercise.notes || '');
  const [sets, setSets] = useState(
    exercise.sets?.length
      ? exercise.sets.map(s => ({ reps: s.reps, weight_kg: s.weight_kg ?? '' }))
      : [{ reps: '', weight_kg: '' }]
  );
  const [loading, setLoading] = useState(false);

  const updateSet = (i, key, val) => setSets(s => s.map((r, idx) => idx === i ? { ...r, [key]: val } : r));
  const addSet = () => setSets(s => [...s, { reps: '', weight_kg: '' }]);
  const removeSet = (i) => setSets(s => s.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put(`/exercises/${exercise.id}`, {
        name,
        youtube_url: youtubeUrl || null,
        notes: notes || null,
        sets: sets.filter(s => s.reps).map(s => ({
          reps: parseInt(s.reps),
          weight_kg: s.weight_kg !== '' ? parseFloat(s.weight_kg) : null,
        })),
      });
      onSave(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="card w-full max-w-md animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-200">Edit Exercise</h2>
          <button onClick={onClose} className="text-steel-500 hover:text-slate-200 transition-colors"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Exercise Name *</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">YouTube Link</label>
              <input className="input" type="url" placeholder="https://youtube.com/..." value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} />
            </div>
            <div>
              <label className="label">Notes</label>
              <input className="input" placeholder="Form cues…" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>

          {/* Sets */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5" />
              <span className="text-xs text-steel-500 uppercase tracking-wider w-20 text-center">Reps</span>
              <span className="text-xs text-steel-500 uppercase tracking-wider w-24 text-center">Weight (kg)</span>
            </div>
            <div className="space-y-2">
              {sets.map((s, i) => (
                <SetRow key={i} index={i} set={s} onChange={updateSet} onRemove={removeSet} canRemove={sets.length > 1} />
              ))}
            </div>
            <button type="button" onClick={addSet} className="mt-2 text-xs text-volt-400 hover:text-volt-500 flex items-center gap-1 transition-colors">
              <Plus size={11} /> Add set
            </button>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-ghost flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={loading}>
              <Check size={13} />
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Exercise card ─────────────────────────────────────────────────────────────
function ExerciseCard({ exercise, onDelete, onEdit }) {
  return (
    <div className="bg-carbon-700/50 rounded-xl border border-carbon-600 p-4 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">{exercise.name}</span>
          {exercise.youtube_url && (
            <a href={exercise.youtube_url} target="_blank" rel="noreferrer" className="text-red-400 hover:text-red-300 transition-colors" title="Watch technique">
              <Youtube size={13} />
            </a>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(exercise)} className="p-1.5 text-steel-500 hover:text-volt-400 transition-colors" title="Edit">
            <Pencil size={13} />
          </button>
          <button onClick={() => onDelete(exercise.id)} className="p-1.5 text-steel-500 hover:text-red-400 transition-colors" title="Delete">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Sets table */}
      {exercise.sets?.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex gap-3 mb-1">
            <span className="text-xs text-steel-600 w-6 text-center">SET</span>
            <span className="text-xs text-steel-600 w-14 text-center">REPS</span>
            <span className="text-xs text-steel-600 w-16 text-center">WEIGHT</span>
          </div>
          {exercise.sets.map((s) => (
            <div key={s.id} className="flex gap-3 items-center">
              <span className="text-xs font-mono text-steel-500 w-6 text-center">{s.set_number}</span>
              <span className="font-mono text-sm text-volt-400 bg-volt-400/10 rounded px-2 py-0.5 w-14 text-center">{s.reps}</span>
              <span className="font-mono text-sm text-slate-300 w-16 text-center">
                {s.weight_kg ? `${s.weight_kg} kg` : <span className="text-steel-600">—</span>}
              </span>
            </div>
          ))}
        </div>
      )}

      {exercise.notes && (
        <p className="text-xs text-steel-500 mt-3 pt-3 border-t border-carbon-600 italic">{exercise.notes}</p>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function WorkoutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null); // exercise being edited

  useEffect(() => {
    api.get(`/workouts/${id}`)
      .then(r => setWorkout(r.data))
      .catch(() => navigate('/workouts'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async (exerciseId) => {
    if (!confirm('Delete this exercise?')) return;
    await api.delete(`/exercises/${exerciseId}`);
    setWorkout(w => ({ ...w, exercises: w.exercises.filter(e => e.id !== exerciseId) }));
  };

  const handleAdd = (ex) => {
    setWorkout(w => ({ ...w, exercises: [...(w.exercises || []), ex] }));
    setShowAdd(false);
  };

  const handleSave = (updated) => {
    setWorkout(w => ({ ...w, exercises: w.exercises.map(e => e.id === updated.id ? updated : e) }));
    setEditing(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-volt-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl animate-slide-up">
      <Link to="/workouts" className="inline-flex items-center gap-1.5 text-steel-500 hover:text-slate-200 text-sm mb-6 transition-colors">
        <ArrowLeft size={14} /> All Workouts
      </Link>

      <div className="card mb-6">
        <h1 className="font-display text-4xl text-slate-100 tracking-wider uppercase">{workout?.name}</h1>
        <p className="text-steel-500 text-sm mt-1">
          {workout?.date && new Date(workout.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          {workout?.duration_minutes && ` · ${workout.duration_minutes} min`}
        </p>
        {workout?.notes && (
          <p className="text-steel-400 text-sm mt-3 pt-3 border-t border-carbon-700 italic">{workout.notes}</p>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-200">
          Exercises <span className="text-steel-500 font-normal text-sm ml-1">({workout?.exercises?.length || 0})</span>
        </h2>
        <button className="btn-ghost flex items-center gap-1.5 text-xs" onClick={() => setShowAdd(s => !s)}>
          {showAdd ? <X size={12} /> : <Plus size={12} />}
          {showAdd ? 'Cancel' : 'Add Exercise'}
        </button>
      </div>

      {workout?.exercises?.length === 0 && !showAdd && (
        <div className="card text-center py-12">
          <p className="text-steel-500 text-sm mb-3">No exercises yet.</p>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>Add first exercise</button>
        </div>
      )}

      <div className="space-y-3">
        {workout?.exercises?.map(ex => (
          <ExerciseCard key={ex.id} exercise={ex} onDelete={handleDelete} onEdit={setEditing} />
        ))}
      </div>

      {showAdd && <AddExerciseForm workoutId={id} onAdd={handleAdd} />}
      {editing && <EditModal exercise={editing} onSave={handleSave} onClose={() => setEditing(null)} />}
    </div>
  );
}
