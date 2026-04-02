const express = require('express');
const router = express.Router();
const radioController = require('../controllers/radioController');

router.get('/streams', radioController.streams);
router.get('/streams/:id', radioController.streamDetail);
router.get('/podcasts', radioController.podcasts);
router.get('/latest-coverage', radioController.latestCoverage);
router.get('/feed', radioController.feed);

module.exports = router;
