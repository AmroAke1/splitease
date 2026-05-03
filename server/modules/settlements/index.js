const router = require('express').Router();
const pool = require('../../config/db');
const auth = require('../../middleware/auth');

router.use(auth);

router.post('/', async (req, res) => {
  const { group_id, paid_to, amount } = req.body;
  if (!group_id || !paid_to || !amount) {
    return res.status(400).json({ error: 'group_id, paid_to, and amount are required' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const balance = await client.query(
      `SELECT id, amount FROM balances
       WHERE group_id = $1 AND owes_user_id = $2 AND owed_user_id = $3`,
      [group_id, req.user.id, paid_to]
    );
    if (!balance.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No outstanding balance found for this settlement' });
    }

    const settlementResult = await client.query(
      `INSERT INTO settlements (id, group_id, paid_by, paid_to, amount, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW()) RETURNING *`,
      [group_id, req.user.id, paid_to, amount]
    );

    const newAmount = parseFloat(balance.rows[0].amount) - parseFloat(amount);
    if (newAmount > 0.001) {
      await client.query(
        'UPDATE balances SET amount = $1, updated_at = NOW() WHERE id = $2',
        [newAmount, balance.rows[0].id]
      );
    } else {
      await client.query('DELETE FROM balances WHERE id = $1', [balance.rows[0].id]);
    }

    await client.query('COMMIT');

    const io = req.app.get('io');
    if (io) io.to(`group_${group_id}`).emit('settlement_added', settlementResult.rows[0]);

    res.status(201).json(settlementResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.get('/:groupId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*,
              payer.name AS paid_by_name,
              payee.name AS paid_to_name
       FROM settlements s
       JOIN users payer ON s.paid_by = payer.id
       JOIN users payee ON s.paid_to = payee.id
       WHERE s.group_id = $1
       ORDER BY s.created_at DESC`,
      [req.params.groupId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
