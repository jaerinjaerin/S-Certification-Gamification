import crypto from "crypto";
import { decrypt, encrypt } from "./encrypt";

describe("Encryption and Decryption", () => {
  const email = "test@example.com";

  beforeAll(() => {
    // 테스트 전 SECRET_KEY 설정
    process.env.ENCRYPT_SECRET_KEY =
      "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2";
  });

  afterAll(() => {
    // 테스트 후 SECRET_KEY 제거
    delete process.env.ENCRYPT_SECRET_KEY;
  });

  describe("Fixed IV encryption", () => {
    it("should return the same encrypted value for the same input", () => {
      const encrypted1 = encrypt(email, true);
      const encrypted2 = encrypt(email, true);

      expect(encrypted1).toEqual(encrypted2); // 고정된 IV에서는 같은 값이어야 함
    });

    it("should decrypt back to the original value", () => {
      const encrypted = encrypt(email, true);
      const decrypted = decrypt(encrypted, true);

      expect(decrypted).toEqual(email); // 복호화 결과는 원래 값이어야 함
    });
  });

  describe("Random IV encryption", () => {
    it("should return different encrypted values for the same input", () => {
      const encrypted1 = encrypt(email, false);
      const encrypted2 = encrypt(email, false);

      expect(encrypted1).not.toEqual(encrypted2); // 랜덤 IV에서는 다른 값이어야 함
    });

    it("should decrypt back to the original value", () => {
      const encrypted = encrypt(email, false);
      const decrypted = decrypt(encrypted, false);

      expect(decrypted).toEqual(email); // 복호화 결과는 원래 값이어야 함
    });
  });

  describe("Error handling", () => {
    it("should throw an error if SECRET_KEY is missing", () => {
      delete process.env.ENCRYPT_SECRET_KEY;

      expect(() => encrypt(email)).toThrow(
        "SECRET_KEY must be a 64-character hexadecimal string (32 bytes)."
      );

      process.env.ENCRYPT_SECRET_KEY =
        "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2";
    });

    it("should throw an error for invalid encrypted data format", () => {
      expect(() => decrypt("invalid-data", false)).toThrow(
        "Invalid encrypted data format"
      );
    });

    it("should throw an error for missing IV in non-fixed mode", () => {
      const encrypted = crypto.randomBytes(32).toString("base64"); // 잘못된 형식의 데이터
      expect(() => decrypt(encrypted, false)).toThrow(
        "Invalid encrypted data format"
      );
    });

    it("should throw an error if IV length is incorrect", () => {
      const fakeEncryptedData = `${crypto
        .randomBytes(8)
        .toString("hex")}:${crypto.randomBytes(32).toString("base64")}`; // IV 길이가 잘못된 데이터
      expect(() => decrypt(fakeEncryptedData, false)).toThrow(
        "Invalid encrypted data format"
      );
    });
  });
});
