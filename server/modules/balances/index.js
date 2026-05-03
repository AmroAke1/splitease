const router = require('express').Router();
const pool = require('../../config/db');
const auth = require('../../middleware/auth');

router.use(auth);

router.get('/:groupId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.id, b.group_id, b.owes_user_id, b.owed_user_id, b.amount, b.updated_at,
              u1.name AS owes_name, u2.name AS owed_name
       FROM balances b
       JOIN users u1 ON b.owes_user_id = u1.id
       JOIN users u2 ON b.owed_user_id = u2.id
       WHERE b.group_id = $1
       ORDER BY b.amount DESC`,
      [req.params.groupId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;