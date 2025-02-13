const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const { createObjectCsvWriter } = require("csv-writer");
const crypto = require("crypto");

const prisma = new PrismaClient();

// AES 복호화 함수
const IV_LENGTH = 16; // AES uses a 16-byte IV
const SECRET_KEY =
  "17e252f73279a0354e3a7d67f361ac92b0d3f851705f88d0ebb8d7697642bc63"; // 32-byte key

// function encrypt(email, useFixedIV) {
//   const iv = useFixedIV
//     ? Buffer.alloc(IV_LENGTH, 0)
//     : crypto.randomBytes(IV_LENGTH); // Fixed or random IV
//   const cipher = crypto.createCipheriv("aes-256-cbc", SECRET_KEY, iv);

//   let encrypted = cipher.update(email, "utf8", "base64");
//   encrypted += cipher.final("base64");

//   // Combine IV and encrypted data, separated by a colon
//   return useFixedIV ? encrypted : `${iv.toString("hex")}:${encrypted}`;
// }

function encrypt(email, useFixedIV = false) {
  const secretKey = Buffer.from(SECRET_KEY, "hex");

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

function decrypt(encryptedData, useFixedIV = false) {
  if (!encryptedData) return null;

  let iv;
  let encrypted;

  if (useFixedIV) {
    iv = Buffer.alloc(IV_LENGTH, 0); // Fixed IV (zeros)
    encrypted = encryptedData;
  } else {
    const [ivHex, encryptedPart] = encryptedData.split(":");
    if (!ivHex || !encryptedPart) {
      console.error("❌ Invalid encrypted data format:", encryptedData);
      return null;
    }

    try {
      iv = Buffer.from(ivHex, "hex");
      if (iv.length !== IV_LENGTH) throw new Error();
    } catch {
      console.error("❌ Invalid IV format:", encryptedData);
      return null;
    }
    encrypted = encryptedPart;
  }

  try {
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(SECRET_KEY, "hex"),
      iv
    );
    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("❌ Decryption failed:", error.message);
    return null;
  }
}

async function convert() {
  console.log(encrypt("crew.s.fujita", true));
}

// ✅ 실행
convert();
