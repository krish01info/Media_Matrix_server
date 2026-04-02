const express = require('express');
const router = express.Router();
const globalController = require('../controllers/globalController');

router.get('/highlights', globalController.highlights);
router.get('/map-insights', globalController.mapInsights);
router.get('/regional-pulse', globalController.regionalPulse);
router.get('/trending-topics', globalController.trendingTopics);
router.get('/compare-coverage', globalController.compareCoverage);
router.get('/independent-voices', globalController.independentVoices);
router.get('/feed', globalController.feed);

module.exports = router;
