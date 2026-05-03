const router = require('express').Router();
const pool = require('../../config/db');
const auth = require('../../middleware/auth');

router.use(auth);

router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Group name is required' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const groupResult = await client.query(
      `INSERT INTO groups (id, name, created_by, created_at)
       VALUES (gen_random_uuid(), $1, $2, NOW()) RETURNING *`,
      [name, req.user.id]
    );
    const group = groupResult.rows[0];
    await client.query(
      `INSERT INTO group_members (id, group_id, user_id, joined_at)
       VALUES (gen_random_uuid(), $1, $2, NOW())`,
      [group.id, req.user.id]
    );
    await client.query('COMMIT');
    res.status(201).json(group);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT g.* FROM groups g
       JOIN group_members gm ON g.id = gm.group_id
       WHERE gm.user_id = $1
       ORDER BY g.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const groupResult = await pool.query(
      `SELECT g.* FROM groups g
       JOIN group_members gm ON g.id = gm.group_id
       WHERE g.id = $1 AND gm.user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!groupResult.rows[0]) return res.status(404).json({ error: 'Group not found' });
    const membersResult = await pool.query(
      `SELECT u.id, u.name, u.email, gm.joined_at
       FROM users u
       JOIN group_members gm ON u.id = gm.user_id
       WHERE gm.group_id = $1`,
      [req.params.id]
    );
    res.json({ ...groupResult.rows[0], members: membersResult.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
