const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

router.get('/by-category/:slug', articleController.byCategory);
router.get('/by-source/:slug', articleController.bySource);
router.get('/by-reporter/:slug', articleController.byReporter);
router.get('/by-region/:slug', articleController.byRegion);
router.get('/by-tag/:slug', articleController.byTag);
router.get('/:uuid', articleController.getByUuid);

module.exports = router;
