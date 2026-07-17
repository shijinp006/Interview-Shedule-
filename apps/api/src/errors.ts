import { ERROR_CODES } from "@micro-ats/shared";

/**
 * Base application error. These are plain Error subclasses with NO MongoDB
 * transaction error labels, so throwing one inside `session.withTransaction`
 * aborts the transaction WITHOUT triggering a retry (see ADR-0002).
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, ERROR_CODES.VALIDATION, message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(404, ERROR_CODES.NOT_FOUND, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(401, ERROR_CODES.UNAUTHORIZED, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code: string, details?: unknown) {
    super(409, code, message, details);
  }
}
