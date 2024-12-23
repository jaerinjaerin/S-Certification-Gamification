import crypto from "crypto";

// Function to get the SECRET_KEY and validate its format
function getSecretKey(): Buffer {
  const secretKey = process.env.ENCRYPT_SECRET_KEY;
  if (!secretKey || secretKey.length !== 64) {
    throw new Error(
      "SECRET_KEY must be a 64-character hexadecimal string (32 bytes)."
    );
  }
  return Buffer.from(secretKey, "hex");
}

const IV_LENGTH = 16; // AES uses a 16-byte IV

/**
 * Encrypt an email
 * @param {string} email - Email to encrypt
 * @returns {string} - Encrypted email in Base64 format with IV prepended
 */
export function encryptEmail(email: string): string {
  const secretKey = getSecretKey();
  const iv = crypto.randomBytes(IV_LENGTH); // Generate a random IV
  const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, iv);

  let encrypted = cipher.update(email, "utf8", "base64");
  encrypted += cipher.final("base64");

  // Combine IV and encrypted data, separated by a colon
  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt an encrypted email
 * @param {string} encryptedData - Encrypted email with IV prepended
 * @returns {string} - Decrypted email
 */
export function decryptEmail(encryptedData: string): string {
  const secretKey = getSecretKey();

  // Split the IV and encrypted data
  const [ivHex, encrypted] = encryptedData.split(":");
  if (!ivHex || !encrypted) {
    throw new Error("Invalid encrypted data format");
  }

  let iv: Buffer;
  try {
    iv = Buffer.from(ivHex, "hex");
    if (iv.length !== IV_LENGTH) {
      throw new Error();
    }
  } catch {
    throw new Error("Invalid encrypted data format");
  }

  const decipher = crypto.createDecipheriv("aes-256-cbc", secretKey, iv);

  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
