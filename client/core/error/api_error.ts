export class ApiError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message); // 기본 Error의 message 설정
    this.statusCode = statusCode;
    this.code = code;

    // Ensure proper inheritance (used in TypeScript/ES6)
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
