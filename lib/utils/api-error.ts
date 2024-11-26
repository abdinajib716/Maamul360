export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(400, message, details);
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed') {
    super(401, message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Access denied') {
    super(403, message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(404, message);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Resource conflict') {
    super(409, message);
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string = 'Database operation failed', details?: any) {
    super(500, message, details);
  }
}

export class EmailError extends ApiError {
  constructor(message: string = 'Email operation failed', details?: any) {
    super(500, message, details);
  }
}
