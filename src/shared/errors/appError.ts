export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly details?: any;

    constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: any) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestError extends AppError {
    constructor(message: string, details?: any) {
        super(message, 400, 'BAD_REQUEST', details);
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Invalid request payload', details?: any) {
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access', details?: any) {
        super(message, 401, 'UNAUTHORIZED', details);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden resource', details?: any) {
        super(message, 403, 'FORBIDDEN', details);
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found', code = 'NOT_FOUND', details?: any) {
        super(message, 404, code, details);
    }
}

export class ConflictError extends AppError {
    constructor(message: string, details?: any) {
        super(message, 409, 'CONFLICT', details);
    }
}

export class PaymentFailedError extends AppError {
    constructor(message = 'Payment transaction failed', details?: any) {
        super(message, 402, 'PAYMENT_FAILED', details);
    }
}
