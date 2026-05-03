const router = require('express').Router();

// GET /api/expenses?groupId=
router.get('/', (req, res) => {
  res.json({ message: 'list expenses placeholder' });
});

// POST /api/expenses
router.post('/', (req, res) => {
  res.json({ message: 'create expense placeholder' });
});

// GET /api/expenses/:id
router.get('/:id', (req, res) => {
  res.json({ message: `get expense ${req.params.id} placeholder` });
});

// PUT /api/expenses/:id
router.put('/:id', (req, res) => {
  res.json({ message: `update expense ${req.params.id} placeholder` });
});

// DELETE /api/expenses/:id
router.delete('/:id', (req, res) => {
  res.json({ message: `delete expense ${req.params.id} placeholder` });
});

module.exports = router;