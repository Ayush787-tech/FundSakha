import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { jwtConfig } from '../config';
import { UnauthorizedError } from '../shared/errors/appError';
import merchantRepository from '../repositories/merchant.repository';
import apiKeyRepository from '../repositories/apiKey.repository';

export function hashApiKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
}

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('Missing or invalid Authorization header');
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtConfig.JWT_SECRET) as { merchantId: string; email: string };

        const merchant = await merchantRepository.findById(decoded.merchantId);
        if (!merchant) {
            throw new UnauthorizedError('Merchant account not found or suspended');
        }

        req.merchant = merchant;
        next();
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            next(new UnauthorizedError('Invalid or expired JWT token'));
        } else {
            next(error);
        }
    }
};

export const authenticateApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        let apiKeyRaw = req.headers['x-api-key'] as string;
        if (!apiKeyRaw && req.headers.authorization) {
            const parts = req.headers.authorization.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                apiKeyRaw = parts[1];
            }
        }

        if (!apiKeyRaw) {
            throw new UnauthorizedError('Missing API key in header (X-API-KEY or Bearer token)');
        }

        const keyHash = hashApiKey(apiKeyRaw);
        const apiKeyRecord = await apiKeyRepository.findActiveByKeyHash(keyHash);

        if (!apiKeyRecord || !apiKeyRecord.merchant) {
            throw new UnauthorizedError('Invalid or revoked API key');
        }

        req.merchant = apiKeyRecord.merchant;
        next();
    } catch (error) {
        next(error);
    }
};

export const authenticateAny = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const apiKeyRaw = req.headers['x-api-key'] as string;
    if (apiKeyRaw) {
        return authenticateApiKey(req, res, next);
    }

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        // Check if token looks like API key (e.g., contains pk_live_ or pk_test_)
        if (token.startsWith('pk_live_') || token.startsWith('pk_test_')) {
            return authenticateApiKey(req, res, next);
        }
        return authenticateJWT(req, res, next);
    }

    next(new UnauthorizedError('Authentication credentials required (JWT or API Key)'));
};
