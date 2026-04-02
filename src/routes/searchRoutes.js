const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

router.get('/', searchController.search);
router.get('/categories', searchController.categories);
router.get('/reporters', searchController.reporters);

module.exports = router;
