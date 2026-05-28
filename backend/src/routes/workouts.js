const express = require('express');
const { pool } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT w.*, COUNT(DISTINCT e.id)::int AS exercise_count
       FROM workouts w LEFT JOIN exercises e ON e.workout_id = w.id
       WHERE w.user_id = $1
       GROUP BY w.id ORDER BY w.date DESC, w.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const workoutRes = await pool.query(
      'SELECT * FROM workouts WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!workoutRes.rows[0]) return res.status(404).json({ error: 'Not found' });

    const exRes = await pool.query(
      'SELECT * FROM exercises WHERE workout_id = $1 ORDER BY created_at ASC',
      [req.params.id]
    );

    // Fetch all sets for all exercises in one query
    const exerciseIds = exRes.rows.map(e => e.id);
    let setsMap = {};
    if (exerciseIds.length) {
      const setsRes = await pool.query(
        'SELECT * FROM exercise_sets WHERE exercise_id = ANY($1) ORDER BY set_number ASC',
        [exerciseIds]
      );
      setsRes.rows.forEach(s => {
        if (!setsMap[s.exercise_id]) setsMap[s.exercise_id] = [];
        setsMap[s.exercise_id].push(s);
      });
    }

    const exercises = exRes.rows.map(e => ({ ...e, sets: setsMap[e.id] || [] }));
    res.json({ ...workoutRes.rows[0], exercises });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.post('/', async (req, res) => {
  const { name, duration_minutes, notes, date } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  try {
    const result = await pool.query(
      'INSERT INTO workouts (user_id, name, duration_minutes, notes, date) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.user.id, name.trim(), duration_minutes || null, notes || null, date || new Date().toISOString().split('T')[0]]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.put('/:id', async (req, res) => {
  const { name, duration_minutes, notes, date } = req.body;
  try {
    const result = await pool.query(
      `UPDATE workouts SET name=COALESCE($1,name), duration_minutes=COALESCE($2,duration_minutes),
       notes=COALESCE($3,notes), date=COALESCE($4,date)
       WHERE id=$5 AND user_id=$6 RETURNING *`,
      [name, duration_minutes, notes, date, req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM workouts WHERE id=$1 AND user_id=$2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
