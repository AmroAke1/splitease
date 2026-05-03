const router = require('express').Router();

// GET /api/settlements?groupId=
router.get('/', (req, res) => {
  res.json({ message: 'list settlements placeholder' });
});

// POST /api/settlements
router.post('/', (req, res) => {
  res.json({ message: 'create settlement placeholder' });
});

// GET /api/settlements/:id
router.get('/:id', (req, res) => {
  res.json({ message: `get settlement ${req.params.id} placeholder` });
});

// PUT /api/settlements/:id
router.put('/:id', (req, res) => {
  res.json({ message: `update settlement ${req.params.id} placeholder` });
});

module.exports = router;