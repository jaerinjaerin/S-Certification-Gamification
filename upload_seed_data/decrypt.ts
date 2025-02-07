const crypto = require("crypto");

const IV_LENGTH = 16; // AES uses a 16-byte IV

function decrypt(encryptedData, useFixedIV = false) {
  const secretKey = Buffer.from(
    "17e252f73279a0354e3a7d67f361ac92b0d3f851705f88d0ebb8d7697642bc63",
    "hex"
  );

  let iv;
  let encrypted;

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

const ids = [
  "VN_USER_23165",
  "IND05595",
  "IND12427",
  "IND14577",
  "IND15553",
  "IND16148",
  "VN_USER_24361",
  "IND16518",
  "IND07547",
  "IND12248",
];

function encrypt(email, useFixedIV = false) {
  const secretKey = Buffer.from(
    "17e252f73279a0354e3a7d67f361ac92b0d3f851705f88d0ebb8d7697642bc63",
    "hex"
  );

  if (secretKey.length !== 32) {
    throw new Error("Invalid secret key length. Must be 32 bytes.");
  }

  const iv = useFixedIV
    ? Buffer.alloc(IV_LENGTH, 0) // Fixed IV (all zeros)
    : crypto.randomBytes(IV_LENGTH); // Random IV

  const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, iv);

  let encrypted = cipher.update(email, "utf8", "base64");
  encrypted += cipher.final("base64");

  // Always include IV to ensure consistency during decryption
  return `${iv.toString("hex")}:${encrypted}`;
}

async function main() {
  for (const id of ids) {
    try {
      const result = encrypt(id, true);
      console.log(`Decrypted [${id}] → ${result}`);
    } catch (error) {
      console.error(`Error decrypting [${id}]: ${error.toString()}`);
    }
  }
}

main();
