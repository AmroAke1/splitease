const router = require('express').Router();
const pool = require('../../config/db');
const auth = require('../../middleware/auth');

router.use(auth);

router.post('/', async (req, res) => {
  const { group_id, description, amount, paid_by_name } = req.body;
  if (!group_id || !description || !amount) {
    return res.status(400).json({ error: 'group_id, description, and amount are required' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify requester is a group member
    const memberCheck = await client.query(
      'SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2',
      [group_id, req.user.id]
    );
    if (!memberCheck.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    const expenseResult = await client.query(
      `INSERT INTO expenses (id, group_id, paid_by, paid_by_name, description, amount, split_type, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'equal', NOW()) RETURNING *`,
      [group_id, req.user.id, paid_by_name || null, description, amount]
    );
    const expense = expenseResult.rows[0];

    // Get all group members to split equally
    const membersResult = await client.query(
      'SELECT user_id FROM group_members WHERE group_id = $1',
      [group_id]
    );
    const members = membersResult.rows;
    const share = parseFloat((amount / members.length).toFixed(2));

    // Update balances: each non-payer owes the payer their share
    for (const member of members) {
      if (member.user_id === req.user.id) continue;

      const existing = await client.query(
        `SELECT id, amount FROM balances
         WHERE group_id = $1 AND owes_user_id = $2 AND owed_user_id = $3`,
        [group_id, member.user_id, req.user.id]
      );

      if (existing.rows.length > 0) {
        await client.query(
          'UPDATE balances SET amount = amount + $1, updated_at = NOW() WHERE id = $2',
          [share, existing.rows[0].id]
        );
      } else {
        // Check if the reverse balance exists (payer owes this member)
        const reverse = await client.query(
          `SELECT id, amount FROM balances
           WHERE group_id = $1 AND owes_user_id = $2 AND owed_user_id = $3`,
          [group_id, req.user.id, member.user_id]
        );

        if (reverse.rows.length > 0) {
          const net = parseFloat(reverse.rows[0].amount) - share;
          if (net > 0.001) {
            await client.query(
              'UPDATE balances SET amount = $1, updated_at = NOW() WHERE id = $2',
              [net, reverse.rows[0].id]
            );
          } else if (net < -0.001) {
            // Flip direction
            await client.query(
              `UPDATE balances
               SET owes_user_id = $1, owed_user_id = $2, amount = $3, updated_at = NOW()
               WHERE id = $4`,
              [member.user_id, req.user.id, Math.abs(net), reverse.rows[0].id]
            );
          } else {
            await client.query('DELETE FROM balances WHERE id = $1', [reverse.rows[0].id]);
          }
        } else {
          await client.query(
            `INSERT INTO balances (id, group_id, owes_user_id, owed_user_id, amount, updated_at)
             VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())`,
            [group_id, member.user_id, req.user.id, share]
          );
        }
      }
    }

    await client.query('COMMIT');

    // Emit real-time event
    const io = req.app.get('io');
    if (io) io.to(`group_${group_id}`).emit('expense_added', expense);

    res.status(201).json(expense);
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
      `SELECT e.*, COALESCE(e.paid_by_name, u.name) AS paid_by_name
       FROM expenses e
       LEFT JOIN users u ON e.paid_by = u.id
       WHERE e.group_id = $1
       ORDER BY e.created_at DESC`,
      [req.params.groupId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
