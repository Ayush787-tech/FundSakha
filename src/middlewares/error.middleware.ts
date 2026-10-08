import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/appError';
import { ZodError } from 'zod';
import logger from '../config/logger.config';

export const appErrorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    logger.error(`[Error] ${err.message}`, {
        stack: err.stack,
        url: req.url,
        method: req.method
    });

    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                ...(err.details ? { details: err.details } : {})
            }
        });
        return;
    }

    if (err instanceof ZodError) {
        res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid request payload',
                details: err.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message
                }))
            }
        });
        return;
    }

    next(err);
};

export const genericErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    logger.error(`[Unhandled Internal Error] ${err.message}`, { stack: err.stack });

    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected internal server error occurred'
        }
    });
};