const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const { createObjectCsvWriter } = require("csv-writer");
const crypto = require("crypto");

const prisma = new PrismaClient();

// AES 복호화 함수
const IV_LENGTH = 16; // AES uses a 16-byte IV
const SECRET_KEY =
  "17e252f73279a0354e3a7d67f361ac92b0d3f851705f88d0ebb8d7697642bc63"; // 32-byte key

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

async function exportDataToCSV() {
  try {
    console.log("🔍 데이터 조회 중...");

    // ✅ 1️⃣ SQL 실행 (Prisma + Raw Query)
    const data = await prisma.$queryRaw`
      SELECT 
        uq."id" AS quiz_log_id,
        uq."userId",
        uq."isCompleted",
        uq."lastCompletedStage",
        uq."elapsedSeconds",
        uq."quizSetId",
        uq."authType",
        uq."createdAt",
        uq."updatedAt",
        a."provider_account_id",
        a."expires_at",
        a."type"
      FROM "UserQuizLog" uq
      JOIN "accounts" a ON uq."userId" = a."user_id"
      WHERE uq."domainId" = '46';
    `;

    if (data.length === 0) {
      console.log("⚠️ 데이터가 없습니다.");
      return;
    }

    console.log(`✅ ${data.length}개의 데이터가 조회되었습니다.`);

    // // ✅ 2️⃣ 복호화 및 데이터 변환
    // const processedData = data.map((row) => ({
    //   // quiz_log_id: row.quiz_log_id,
    //   userId: decrypt(row.provider_account_id, true) || "DECRYPTION_FAILED", // 복호화 적용
    //   // userId: row.userId,
    //   // isCompleted: row.isCompleted,
    //   "완료한 Stage":
    //     row.lastCompletedStage != null ? row.lastCompletedStage + 1 : null,
    //   // createdAt: row.createdAt,
    //   // updatedAt: row.updatedAt,
    //   // elapsedSeconds: row.elapsedSeconds,
    //   // quizSetId: row.quizSetId,
    //   // expires_at: row.expires_at,
    //   // type: row.type,
    // }));

    // ✅ 2️⃣ 복호화 및 데이터 변환
    const seenUserIds = new Set();
    const duplicateUserIds = new Set();

    const processedData = data.map((row) => {
      const decryptedUserId =
        decrypt(row.provider_account_id, true) || "DECRYPTION_FAILED";

      // 중복 체크
      if (seenUserIds.has(decryptedUserId)) {
        duplicateUserIds.add(decryptedUserId);
      } else {
        seenUserIds.add(decryptedUserId);
      }

      return {
        userId: decryptedUserId, // 복호화 적용
        authType: row.authType,
        "완료한 Stage":
          row.lastCompletedStage != null ? row.lastCompletedStage + 1 : null,
      };
    });

    // ✅ 3️⃣ 중복된 userId 로그 출력
    if (duplicateUserIds.size > 0) {
      console.warn("⚠️ 중복된 userId 발견:", Array.from(duplicateUserIds));
    } else {
      console.log("✅ 중복된 userId 없음");
    }

    // ✅ 3️⃣ CSV 파일 저장 설정
    const csvWriter = createObjectCsvWriter({
      path: "quiz_log_data.csv", // 저장할 파일명
      header: Object.keys(processedData[0]).map((key) => ({
        id: key,
        title: key,
      })),
    });

    // ✅ 4️⃣ CSV 파일 생성
    await csvWriter.writeRecords(processedData);

    console.log("🎉 CSV 파일이 생성되었습니다: quiz_log_data.csv");
  } catch (error) {
    console.error("❌ 데이터 추출 중 오류 발생:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// ✅ 실행
exportDataToCSV();
