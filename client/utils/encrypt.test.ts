import { decryptEmail, encryptEmail } from "./encrypt";

describe("Email Encryption and Decryption", () => {
  const originalEmail = "example@example.com";

  beforeAll(() => {
    // 테스트 환경에서 사용할 ENCRYPT_SECRET_KEY 설정
    process.env.ENCRYPT_SECRET_KEY =
      "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"; // 64자 16진수 문자열
  });

  test("Encrypting the same email should produce the same result", () => {
    const encrypted1 = encryptEmail(originalEmail);
    const encrypted2 = encryptEmail(originalEmail);

    expect(encrypted1).toBe(encrypted2); // 동일한 암호화 결과
  });

  test("Decrypting an encrypted email should return the original email", () => {
    const encrypted = encryptEmail(originalEmail);
    const decrypted = decryptEmail(encrypted, originalEmail);

    expect(decrypted).toBe(originalEmail); // 원래 이메일로 복구
  });

  test("Different emails should produce different encrypted outputs", () => {
    const email1 = "example1@example.com";
    const email2 = "example2@example.com";

    const encrypted1 = encryptEmail(email1);
    const encrypted2 = encryptEmail(email2);

    expect(encrypted1).not.toBe(encrypted2); // 서로 다른 결과
  });

  test("Decrypting with a different email should fail", () => {
    const encrypted = encryptEmail(originalEmail);
    const wrongEmail = "wrong@example.com";

    expect(() => decryptEmail(encrypted, wrongEmail)).toThrow();
  });
});
