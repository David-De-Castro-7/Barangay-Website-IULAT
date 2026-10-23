const express = require('express');
const { registerResident, loginResident, getMyProfile } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

router.post('/resident/register', registerResident);
router.post('/resident/login', loginResident);
router.get('/me', requireAuth, getMyProfile);

module.exports = router;
