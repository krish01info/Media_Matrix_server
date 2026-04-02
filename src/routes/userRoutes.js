const express = require('express');
const router = express.Router();
const multer = require('multer');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

// Multer config for avatar uploads (memory storage for Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// All user routes require authentication
router.use(authenticate);

// Profile
router.get('/profile', userController.getProfile);
router.put('/profile', upload.single('avatar'), userController.updateProfile);

// Bookmarks
router.get('/bookmarks', userController.getBookmarks);
router.post('/bookmarks/:articleUuid', userController.addBookmark);
router.delete('/bookmarks/:articleUuid', userController.removeBookmark);

// Reading History
router.get('/history', userController.getHistory);
router.post('/history', userController.recordRead);

// Preferences
router.get('/preferences', userController.getPreferences);
router.put('/preferences', validate(schemas.updatePreferences), userController.updatePreferences);

module.exports = router;
