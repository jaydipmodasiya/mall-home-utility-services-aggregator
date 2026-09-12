const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createDispute, getMyDisputes, getDispute } = require('../controllers/disputeController');

router.post('/', protect, createDispute);
router.get('/me', protect, getMyDisputes);
router.get('/:id', protect, getDispute);

module.exports = router;
