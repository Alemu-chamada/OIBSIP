const express = require('express');
const { body, query } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const requireAuth = require('../middleware/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Rate limiter for auth endpoints (10 requests per 15 min per IP)
// Skip in test environment to avoid blocking test suites
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    errors: [],
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authLimiter);

// 1. Customer Registration
router.post(
  '/register',
  validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ]),
  asyncHandler(authController.register),
);

// 2. Email Verification
router.get(
  '/verify-email',
  validate([
    query('token').notEmpty().withMessage('Verification token is required'),
  ]),
  asyncHandler(authController.verifyEmail),
);

// 3. Customer Login
router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  asyncHandler(authController.login),
);

// 4. Admin Login
router.post(
  '/admin-login',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  asyncHandler(authController.adminLogin),
);

// 5. Customer Logout
router.post('/logout', requireAuth, asyncHandler(authController.logout));

// 6. Admin Logout
router.post('/admin-logout', requireAuth, asyncHandler(authController.adminLogout));

// 7. Forgot Password
router.post(
  '/forgot-password',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
  ]),
  asyncHandler(authController.forgotPassword),
);

// 8. Reset Password
router.post(
  '/reset-password',
  validate([
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ]),
  asyncHandler(authController.resetPassword),
);

// 9. Current User Profile
router.get('/me', requireAuth, asyncHandler(authController.getMe));

module.exports = router;
