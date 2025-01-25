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
 * Encrypt an email address
 * @param {string} email - The email to encrypt
 * @param {boolean} useFixedIV - If true, use a fixed IV for deterministic encryption
 * @returns {string} - The encrypted email
 */
export function encrypt(email: string, useFixedIV: boolean = false): string {
  const secretKey = getSecretKey();
  const iv = useFixedIV
    ? Buffer.alloc(IV_LENGTH, 0)
    : crypto.randomBytes(IV_LENGTH); // Fixed or random IV
  const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, iv);

  let encrypted = cipher.update(email, "utf8", "base64");
  encrypted += cipher.final("base64");

  // Combine IV and encrypted data, separated by a colon
  return useFixedIV ? encrypted : `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt an encrypted email
 * @param {string} encryptedData - Encrypted email with IV prepended
 * @param {boolean} useFixedIV - If true, assume a fixed IV was used
 * @returns {string} - The decrypted email
 */
export function decrypt(
  encryptedData: string,
  useFixedIV: boolean = false
): string {
  const secretKey = getSecretKey();

  let iv: Buffer;
  let encrypted: string;

  if (useFixedIV) {
    // Use fixed IV (all zeros)
    iv = Buffer.alloc(IV_LENGTH, 0);
    encrypted = encryptedData;
  } else {
    // Split the IV and encrypted data
    const [ivHex, encryptedPart] = encryptedData.split(":");
    if (!ivHex || !encryptedPart) {
      throw new Error("Invalid encrypted data format");
    }

    try {
      iv = Buffer.from(ivHex, "hex");
      if (iv.length !== IV_LENGTH) {
        throw new Error();
      }
    } catch {
      throw new Error("Invalid encrypted data format");
    }
    encrypted = encryptedPart;
  }

  const decipher = crypto.createDecipheriv("aes-256-cbc", secretKey, iv);

  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
