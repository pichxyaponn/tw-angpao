// --- Custom Error Classes ---

export class ValidationError extends Error {
  code: string;
  constructor(code: Readonly<string>, message: Readonly<string>) {
    super(message);
    this.code = code;
    this.name = "ValidationError";
  }
}

export class NetworkError extends Error {
  code: string;
  constructor(code: Readonly<string>, message: Readonly<string>) {
    super(message);
    this.code = code;
    this.name = "NetworkError";
  }
}

export class ApiError extends Error {
  code: string;
  constructor(code: Readonly<string>, message: Readonly<string>) {
    super(message);
    this.code = code;
    this.name = "ApiError";
  }
}

export class JsonParseError extends Error {
  code: string;
  constructor(message: Readonly<string>, originalError: unknown) {
    super(message);
    this.code = "INVALID_JSON_RESPONSE";
    this.name = "JsonParseError";
    this.cause = originalError;
  }
}
