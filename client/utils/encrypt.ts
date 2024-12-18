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
 * Generate a deterministic IV based on the input email
 * @param {string} email - Email to use for generating the IV
 * @returns {Buffer} - Generated IV
 */
function generateDeterministicIV(email: string): Buffer {
  const hash = crypto.createHash("md5").update(email).digest(); // 16 bytes
  return hash.slice(0, IV_LENGTH); // Ensure the length is exactly 16 bytes
}

/**
 * Encrypt an email
 * @param {string} email - Email to encrypt
 * @returns {string} - Encrypted email in Base64 format
 */
export function encryptEmail(email: string): string {
  const secretKey = getSecretKey();
  const iv = generateDeterministicIV(email); // Generate a deterministic IV
  const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, iv);

  let encrypted = cipher.update(email, "utf8", "base64");
  encrypted += cipher.final("base64");

  // Return the encrypted data without the IV (IV can be derived from the email)
  return encrypted;
}

/**
 * Decrypt an encrypted email
 * @param {string} encryptedData - Encrypted email
 * @param {string} email - Original email used for encryption
 * @returns {string} - Decrypted email
 */
export function decryptEmail(encryptedData: string, email: string): string {
  const secretKey = getSecretKey();
  const iv = generateDeterministicIV(email); // Generate the same deterministic IV
  const decipher = crypto.createDecipheriv("aes-256-cbc", secretKey, iv);

  let decrypted = decipher.update(encryptedData, "base64", "utf8");
  decrypted += decipher.final("utf8");

  // 이메일이 일치하지 않으면 예외를 발생시킴
  if (decrypted !== email) {
    throw new Error("Decryption failed: IV mismatch or invalid encrypted data");
  }

  return decrypted;
}
