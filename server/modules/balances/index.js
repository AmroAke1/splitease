const router = require('express').Router();
const pool = require('../../config/db');
const auth = require('../../middleware/auth');

router.use(auth);

router.get('/:groupId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*,
              owes.name  AS owes_user_name,
              owed.name  AS owed_user_name
       FROM balances b
       JOIN users owes ON b.owes_user_id = owes.id
       JOIN users owed ON b.owed_user_id = owed.id
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
