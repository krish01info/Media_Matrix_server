const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

// Multer config (memory storage for Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// All admin routes require authentication
router.use(authenticate);

// Articles
router.post('/articles', upload.single('image'), validate(schemas.createArticle), adminController.createArticle);
router.put('/articles/:id', upload.single('image'), adminController.updateArticle);
router.delete('/articles/:id', adminController.deleteArticle);

// Sources
router.post('/sources', upload.single('logo'), validate(schemas.createSource), adminController.createSource);

// Reporters
router.post('/reporters', upload.single('avatar'), validate(schemas.createReporter), adminController.createReporter);

// Radio Streams
router.post('/radio-streams', upload.single('thumbnail'), validate(schemas.createRadioStream), adminController.createRadioStream);

// Newspapers
router.post('/newspapers', upload.single('cover_image'), validate(schemas.createNewspaper), adminController.createNewspaper);

// Trending Topics
router.post('/trending-topics', validate(schemas.createTrendingTopic), adminController.createTrendingTopic);

// World Map Insights
router.post('/world-map-insights', validate(schemas.createWorldMapInsight), adminController.createWorldMapInsight);

// Compare Coverage
router.post('/compare-coverage', validate(schemas.createCompareCoverage), adminController.createCompareCoverage);

// Regional Charts
router.post('/regional-charts', validate(schemas.createRegionalChart), adminController.createRegionalChart);

module.exports = router;
