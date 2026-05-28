const express = require('express');
const { pool } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// GET /api/stats - dashboard summary stats
router.get('/', async (req, res) => {
  try {
    const [totalWorkouts, totalExercises, thisWeek, recentWorkouts] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM workouts WHERE user_id = $1', [req.user.id]),
      pool.query(
        `SELECT COUNT(*) FROM exercises e JOIN workouts w ON w.id = e.workout_id WHERE w.user_id = $1`,
        [req.user.id]
      ),
      pool.query(
        `SELECT COUNT(*) FROM workouts WHERE user_id = $1 AND date >= NOW() - INTERVAL '7 days'`,
        [req.user.id]
      ),
      pool.query(
        `SELECT w.id, w.name, w.date, w.duration_minutes, COUNT(e.id)::int AS exercise_count
         FROM workouts w LEFT JOIN exercises e ON e.workout_id = w.id
         WHERE w.user_id = $1
         GROUP BY w.id ORDER BY w.date DESC LIMIT 5`,
        [req.user.id]
      ),
    ]);

    res.json({
      total_workouts: parseInt(totalWorkouts.rows[0].count),
      total_exercises: parseInt(totalExercises.rows[0].count),
      workouts_this_week: parseInt(thisWeek.rows[0].count),
      recent_workouts: recentWorkouts.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
