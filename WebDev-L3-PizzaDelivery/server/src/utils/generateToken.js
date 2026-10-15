const crypto = require('crypto');

/**
 * Generate a cryptographically secure random token string.
 * @returns {string} Raw hex token string
 */
const generateRandomToken = () => crypto.randomBytes(32).toString('hex');

/**
 * Create a SHA-256 hash of a raw token string.
 * @param {string} rawToken - The raw token to hash
 * @returns {string} SHA-256 hex string
 */
const hashToken = (rawToken) => crypto.createHash('sha256').update(rawToken).digest('hex');

module.exports = {
  generateRandomToken,
  hashToken,
};
