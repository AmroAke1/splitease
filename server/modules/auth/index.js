const router = require('express').Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  res.json({ message: 'register placeholder' });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  res.json({ message: 'login placeholder' });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'logout placeholder' });
});

module.exports = router;