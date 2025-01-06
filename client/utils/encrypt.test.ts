import { decrypt, encrypt } from "./encrypt";

describe("Email Encryption and Decryption with Embedded IV", () => {
  const originalEmail = "example@example.com";

  beforeAll(() => {
    // 테스트 환경에서 사용할 ENCRYPT_SECRET_KEY 설정
    process.env.ENCRYPT_SECRET_KEY =
      "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"; // 64자 16진수 문자열
  });

  test("Encrypting and decrypting an email should return the original email", () => {
    const encrypted = encrypt(originalEmail);
    const decrypted = decrypt(encrypted);

    // 복호화 결과가 원본 이메일과 동일해야 함
    expect(decrypted).toBe(originalEmail);
  });

  test("Encrypting the same email twice should produce different results", () => {
    const encrypted1 = encrypt(originalEmail);
    const encrypted2 = encrypt(originalEmail);

    // 같은 이메일이라도 암호화된 결과가 다를 수 있음 (랜덤 IV 사용)
    expect(encrypted1).not.toBe(encrypted2);
  });

  test("Decrypting with an invalid encrypted format should throw an error", () => {
    const invalidEncryptedData = "invalid:format";

    // 잘못된 형식의 암호화 데이터는 복호화 시 에러를 발생해야 함
    expect(() => decrypt(invalidEncryptedData)).toThrow(
      "Invalid encrypted data format"
    );
  });

  test("Decrypting with modified encrypted data should throw an error", () => {
    const encrypted = encrypt(originalEmail);

    // 암호화된 데이터를 조작
    const tamperedEncrypted = encrypted.replace(/.$/, "x");

    // 복호화 시 에러 발생
    expect(() => decrypt(tamperedEncrypted)).toThrow();
  });

  test("Encrypting and decrypting multiple emails should work correctly", () => {
    const emails = [
      "test1@example.com",
      "test2@example.com",
      "test3@example.com",
    ];

    // 여러 이메일에 대해 암호화 및 복호화 확인
    emails.forEach((email) => {
      const encrypted = encrypt(email);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(email);
    });
  });

  test("Invalid SECRET_KEY format should throw an error during encryption", () => {
    const invalidKey = "123456"; // 유효하지 않은 키
    process.env.ENCRYPT_SECRET_KEY = invalidKey;

    // SECRET_KEY가 유효하지 않을 경우 에러 발생
    expect(() => encrypt(originalEmail)).toThrow(
      "SECRET_KEY must be a 64-character hexadecimal string (32 bytes)."
    );

    // 기존 키 복구
    process.env.ENCRYPT_SECRET_KEY =
      "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  });
});
