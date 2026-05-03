const router = require('express').Router();

// GET /api/groups
router.get('/', (req, res) => {
  res.json({ message: 'list groups placeholder' });
});

// POST /api/groups
router.post('/', (req, res) => {
  res.json({ message: 'create group placeholder' });
});

// GET /api/groups/:id
router.get('/:id', (req, res) => {
  res.json({ message: `get group ${req.params.id} placeholder` });
});

// PUT /api/groups/:id
router.put('/:id', (req, res) => {
  res.json({ message: `update group ${req.params.id} placeholder` });
});

// DELETE /api/groups/:id
router.delete('/:id', (req, res) => {
  res.json({ message: `delete group ${req.params.id} placeholder` });
});

module.exports = router;