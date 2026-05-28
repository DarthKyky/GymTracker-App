const express = require('express');
const { pool } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// GET /api/exercises/progress?name=Bench+Press
router.get('/progress', async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'Exercise name required' });
  try {
    const result = await pool.query(
      `SELECT w.date, es.set_number, es.reps, es.weight_kg
       FROM exercise_sets es
       JOIN exercises e ON e.id = es.exercise_id
       JOIN workouts w ON w.id = e.workout_id
       WHERE w.user_id = $1 AND LOWER(e.name) = LOWER($2) AND es.weight_kg IS NOT NULL
       ORDER BY w.date ASC, es.set_number ASC`,
      [req.user.id, name]
    );
    // Return max weight per date for the chart
    const byDate = {};
    result.rows.forEach(r => {
      const d = r.date.toISOString().split('T')[0];
      if (!byDate[d] || parseFloat(r.weight_kg) > parseFloat(byDate[d].weight_kg)) {
        byDate[d] = r;
      }
    });
    res.json(Object.values(byDate));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/exercises/names
router.get('/names', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT e.name FROM exercises e
       JOIN workouts w ON w.id = e.workout_id
       WHERE w.user_id = $1 ORDER BY e.name ASC`,
      [req.user.id]
    );
    res.json(result.rows.map(r => r.name));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/exercises — create exercise with sets array
// Body: { workout_id, name, youtube_url, notes, sets: [{reps, weight_kg}, ...] }
router.post('/', async (req, res) => {
  const { workout_id, name, youtube_url, notes, sets } = req.body;
  if (!workout_id || !name) return res.status(400).json({ error: 'workout_id and name required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const wCheck = await client.query(
      'SELECT id FROM workouts WHERE id = $1 AND user_id = $2',
      [workout_id, req.user.id]
    );
    if (!wCheck.rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Workout not found' }); }

    const exRes = await client.query(
      'INSERT INTO exercises (workout_id, name, youtube_url, notes) VALUES ($1,$2,$3,$4) RETURNING *',
      [workout_id, name.trim(), youtube_url || null, notes || null]
    );
    const exercise = exRes.rows[0];

    const setsData = Array.isArray(sets) && sets.length ? sets : [{ reps: 1, weight_kg: null }];
    const insertedSets = [];
    for (let i = 0; i < setsData.length; i++) {
      const s = setsData[i];
      const sr = await client.query(
        'INSERT INTO exercise_sets (exercise_id, set_number, reps, weight_kg) VALUES ($1,$2,$3,$4) RETURNING *',
        [exercise.id, i + 1, parseInt(s.reps) || 1, s.weight_kg ? parseFloat(s.weight_kg) : null]
      );
      insertedSets.push(sr.rows[0]);
    }

    await client.query('COMMIT');
    res.status(201).json({ ...exercise, sets: insertedSets });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// PUT /api/exercises/:id — update name/url/notes + replace all sets
router.put('/:id', async (req, res) => {
  const { name, youtube_url, notes, sets } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const exRes = await client.query(
      `UPDATE exercises e SET
        name = COALESCE($1, e.name),
        youtube_url = COALESCE($2, e.youtube_url),
        notes = COALESCE($3, e.notes)
       FROM workouts w
       WHERE e.id = $4 AND e.workout_id = w.id AND w.user_id = $5
       RETURNING e.*`,
      [name, youtube_url, notes, req.params.id, req.user.id]
    );
    if (!exRes.rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Exercise not found' }); }

    const exercise = exRes.rows[0];

    if (Array.isArray(sets) && sets.length) {
      await client.query('DELETE FROM exercise_sets WHERE exercise_id = $1', [exercise.id]);
      const insertedSets = [];
      for (let i = 0; i < sets.length; i++) {
        const s = sets[i];
        const sr = await client.query(
          'INSERT INTO exercise_sets (exercise_id, set_number, reps, weight_kg) VALUES ($1,$2,$3,$4) RETURNING *',
          [exercise.id, i + 1, parseInt(s.reps) || 1, s.weight_kg ? parseFloat(s.weight_kg) : null]
        );
        insertedSets.push(sr.rows[0]);
      }
      await client.query('COMMIT');
      return res.json({ ...exercise, sets: insertedSets });
    }

    const setsRes = await client.query(
      'SELECT * FROM exercise_sets WHERE exercise_id = $1 ORDER BY set_number',
      [exercise.id]
    );
    await client.query('COMMIT');
    res.json({ ...exercise, sets: setsRes.rows });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// DELETE /api/exercises/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM exercises e USING workouts w
       WHERE e.id = $1 AND e.workout_id = w.id AND w.user_id = $2 RETURNING e.id`,
      [req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Exercise not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
