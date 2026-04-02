const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate, schemas } = require('../middleware/validate');

// POST /api/auth/register
router.post('/register', validate(schemas.register), authController.register);

// POST /api/auth/login
router.post('/login', validate(schemas.login), authController.login);

// POST /api/auth/refresh
router.post('/refresh', validate(schemas.refreshToken), authController.refresh);

// POST /api/auth/logout
router.post('/logout', validate(schemas.refreshToken), authController.logout);

module.exports = router;
