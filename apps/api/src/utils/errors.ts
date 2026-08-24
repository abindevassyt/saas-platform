export class ApiError extends Error {
  public statusCode: number;
  public type: string;
  public title: string;
  public details?: unknown;

  constructor(statusCode: number, title: string, message: string, details?: unknown, type = 'about:blank') {
    super(message);
    this.statusCode = statusCode;
    this.title = title;
    this.details = details;
    this.type = type;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request', details?: unknown) {
    super(400, 'Bad Request', message, details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized', details?: unknown) {
    super(401, 'Unauthorized', message, details);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden access to requested tenant or resource', details?: unknown) {
    super(403, 'Forbidden', message, details);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found', details?: unknown) {
    super(404, 'Not Found', message, details);
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Resource already exists', details?: unknown) {
    super(409, 'Conflict', message, details);
  }
}

export class TooManyRequestsError extends ApiError {
  constructor(message = 'Rate limit exceeded. Please try again later.', details?: unknown) {
    super(429, 'Too Many Requests', message, details);
  }
}
