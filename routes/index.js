const express = require('express');
const router = express.Router();
const controller = require('../controllers');
const counters = require('../controllers/counters');

router.post('/track/unique', controller.trackUniqueVisitor);
router.post('/track/view', controller.trackView);
router.get('/analytics/unique/:host', controller.analyticsUniqueVisitors);
router.get('/analytics/track/:host/:date', controller.trackVisitor);

router.post('/counter/view', counters.postView);
router.get('/counters/view', counters.getPageViews);


module.exports = router;