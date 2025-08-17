const express = require('express');
const router = express.Router();
const controller = require('../controllers');

router.post('/track/unique', controller.trackUniqueVisitor);
router.get('/analytics/unique/:host', controller.analyticsUniqueVisitors);
router.get('/analytics/track/:host/:date', controller.trackVisitor);

module.exports = router;