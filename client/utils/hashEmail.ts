const { v5 } = require("uuid");

// Define a namespace (use a fixed UUID for consistency)
const NAMESPACE = v5.DNS; // You can also define your custom namespace UUID

/**
 * Hash an email using UUID v5.
 * @param {string} email - The email to hash.
 * @param {string} namespace - The namespace to use (default is v5.DNS).
 * @returns {string} - The UUID v5 hash of the email.
 */
function hashEmailWithUuidV5(email, namespace = NAMESPACE) {
  return v5(email, namespace);
}
