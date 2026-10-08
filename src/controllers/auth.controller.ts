import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';

export class AuthController {
    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await authService.registerMerchant(req.body);
            res.status(201).json({
                success: true,
                message: 'Merchant registered successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await authService.loginMerchant(req.body);
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();
