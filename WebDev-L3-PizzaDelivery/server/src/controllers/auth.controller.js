const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const Admin = require('../models/Admin.model');
const EmailService = require('../services/email.service');
const { generateRandomToken, hashToken } = require('../utils/generateToken');
const { signToken, sendTokenCookie, clearTokenCookie } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const {
  BCRYPT_SALT_ROUNDS,
  VERIFICATION_TOKEN_EXPIRY_HOURS,
  RESET_TOKEN_EXPIRY_HOURS,
} = require('../config/constants');

/**
 * Customer Registration
 * POST /api/auth/register
 */
const register = async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  // Check if account already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return errorResponse(res, 'An account with this email already exists.', 409);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  // Generate verification token (raw UUID sent in email, SHA-256 hash stored in DB)
  const rawVerificationToken = generateRandomToken();
  const hashedVerificationToken = hashToken(rawVerificationToken);
  const verificationTokenExpiry = new Date(
    Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
  );

  // Create user with explicit customer role (never trust client role)
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: 'customer',
    isVerified: false,
    verificationToken: hashedVerificationToken,
    verificationTokenExpiry,
  });

  // Attempt to send verification email
  try {
    await EmailService.sendVerificationEmail(user.email, rawVerificationToken);
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Failed to send verification email:', err.message);
    }
  }

  return successResponse(
    res,
    {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    },
    201,
    'Registration successful. Please verify your email before logging in.',
  );
};

/**
 * Verify Email Address
 * GET /api/auth/verify-email?token=<token>
 */
const verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return errorResponse(res, 'Verification token is required.', 400);
  }

  const hashedToken = hashToken(token);

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpiry: { $gt: new Date() },
  });

  if (!user) {
    return errorResponse(res, 'Invalid or expired verification token.', 400);
  }

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpiry = null;
  await user.save();

  return successResponse(
    res,
    { isVerified: true },
    200,
    'Email verified successfully. You can now log in.',
  );
};

/**
 * Customer Login
 * POST /api/auth/login
 */
const login = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return errorResponse(res, 'Invalid email or password.', 401);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return errorResponse(res, 'Invalid email or password.', 401);
  }

  if (!user.isVerified) {
    return errorResponse(res, 'Please verify your email before logging in.', 403);
  }

  // Issue signed JWT in httpOnly cookie
  const token = signToken({ id: user._id, role: user.role });
  sendTokenCookie(res, token);

  return successResponse(
    res,
    {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    200,
    'Login successful.',
  );
};

/**
 * Admin Login
 * POST /api/auth/admin-login
 */
const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const admin = await Admin.findOne({ email: normalizedEmail });
  if (!admin) {
    return errorResponse(res, 'Invalid admin credentials.', 401);
  }

  const isPasswordValid = await admin.comparePassword(password);
  if (!isPasswordValid) {
    return errorResponse(res, 'Invalid admin credentials.', 401);
  }

  // Issue signed JWT in httpOnly cookie with role=admin
  const token = signToken({ id: admin._id, role: admin.role });
  sendTokenCookie(res, token);

  return successResponse(
    res,
    {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    },
    200,
    'Admin login successful.',
  );
};

/**
 * Customer Logout
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  clearTokenCookie(res);
  return successResponse(res, {}, 200, 'Logged out successfully.');
};

/**
 * Admin Logout
 * POST /api/auth/admin-logout
 */
const adminLogout = async (req, res) => {
  clearTokenCookie(res);
  return successResponse(res, {}, 200, 'Admin logged out successfully.');
};

/**
 * Forgot Password
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });

  // Security requirement: Always return 200 to prevent user enumeration
  if (user) {
    const rawResetToken = generateRandomToken();
    const hashedResetToken = hashToken(rawResetToken);
    const resetTokenExpiry = new Date(
      Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
    );

    user.resetToken = hashedResetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    try {
      await EmailService.sendPasswordResetEmail(user.email, rawResetToken);
    } catch (err) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Failed to send password reset email:', err.message);
      }
    }
  }

  return successResponse(
    res,
    {},
    200,
    'If an account with that email exists, a password reset link has been sent.',
  );
};

/**
 * Reset Password
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token) {
    return errorResponse(res, 'Reset token is required.', 400);
  }

  const hashedToken = hashToken(token);

  const user = await User.findOne({
    resetToken: hashedToken,
    resetTokenExpiry: { $gt: new Date() },
  });

  if (!user) {
    return errorResponse(res, 'Invalid or expired password reset token.', 400);
  }

  // Hash new password and invalidate token
  const newPasswordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  user.passwordHash = newPasswordHash;
  user.resetToken = null;
  user.resetTokenExpiry = null;
  await user.save();

  return successResponse(
    res,
    {},
    200,
    'Password has been reset successfully. You can now log in.',
  );
};

/**
 * Current User Profile / Session
 * GET /api/auth/me
 */
const getMe = async (req, res) => successResponse(res, {
  user: {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    isVerified: req.user.isVerified,
  },
});

module.exports = {
  register,
  verifyEmail,
  login,
  adminLogin,
  logout,
  adminLogout,
  forgotPassword,
  resetPassword,
  getMe,
};
