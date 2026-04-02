const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

router.get('/featured', homeController.featured);
router.get('/trending', homeController.trending);
router.get('/top-charts', homeController.topCharts);
router.get('/newspapers', homeController.newspapers);
router.get('/feed', homeController.feed);

module.exports = router;
