const express = require('express');
const router = express.Router();
const todayController = require('../controllers/todayController');

router.get('/morning-brief', todayController.morningBrief);
router.get('/developing', todayController.developing);
router.get('/trending', todayController.trending);
router.get('/regional-charts', todayController.regionalCharts);
router.get('/feed', todayController.feed);

module.exports = router;
