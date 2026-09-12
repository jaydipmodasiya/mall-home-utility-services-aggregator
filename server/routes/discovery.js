const express = require('express');
const { recordProviderDiscovery } = require('../controllers/discoveryController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.post('/provider-search', (req, res, next) => {
  if (req.headers.authorization) return protect(req, res, () => recordProviderDiscovery(req, res, next));
  return recordProviderDiscovery(req, res, next);
});

module.exports = router;
