import { decryptEmail, encryptEmail } from "./encrypt";

describe("Email Encryption and Decryption", () => {
  const SECRET_KEY =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"; // Valid 64-character hexadecimal key

  beforeAll(() => {
    // Mock environment variable
    process.env.ENCRYPT_SECRET_KEY = SECRET_KEY;
  });

  test("should encrypt and decrypt the email correctly", () => {
    const email = "user@example.com";

    // Encrypt the email
    const encryptedEmail = encryptEmail(email);
    expect(encryptedEmail).toBeDefined();

    // Decrypt the encrypted email
    const decryptedEmail = decryptEmail(encryptedEmail);
    expect(decryptedEmail).toBe(email);
  });

  test("should throw an error if SECRET_KEY is not defined", () => {
    delete process.env.ENCRYPT_SECRET_KEY;

    expect(() => encryptEmail("test@example.com")).toThrow(
      "SECRET_KEY must be a 64-character hexadecimal string (32 bytes)."
    );
  });

  test("should throw an error if encrypted data is malformed", () => {
    const malformedData = "invalid_data";

    expect(() => decryptEmail(malformedData)).toThrow();
  });
});
