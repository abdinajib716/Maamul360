export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: any;
  public readonly errorCode?: string;

  constructor(statusCode: number, message: string, details?: any, errorCode?: string) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.message,
      statusCode: this.statusCode,
      ...(this.errorCode && { errorCode: this.errorCode }),
      ...(this.details && { details: this.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
    };
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(400, message, details, 'VALIDATION_ERROR');
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed') {
    super(401, message, undefined, 'AUTH_ERROR');
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Access denied') {
    super(403, message, undefined, 'FORBIDDEN_ERROR');
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(404, message, undefined, 'NOT_FOUND_ERROR');
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Resource conflict') {
    super(409, message, undefined, 'CONFLICT_ERROR');
  }
}

export class RequestError extends ApiError {
  constructor(message: string = 'Invalid request', details?: any) {
    super(400, message, details, 'REQUEST_ERROR');
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string = 'Database operation failed', details?: any) {
    super(500, message, details, 'DATABASE_ERROR');
  }
}

export class EmailError extends ApiError {
  constructor(message: string = 'Email operation failed', details?: any) {
    super(500, message, details, 'EMAIL_ERROR');
  }
}

export class ServerError extends ApiError {
  constructor(message: string = 'Internal server error', details?: any) {
    super(500, message, details, 'SERVER_ERROR');
  }
}
