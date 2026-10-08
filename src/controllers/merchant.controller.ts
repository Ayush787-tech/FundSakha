import { Request, Response, NextFunction } from 'express';
import merchantService from '../services/merchant.service';

export class MerchantController {
    async createApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const merchantId = req.merchant!.id;
            const keyName = req.body.name;
            const result = await merchantService.createApiKey(merchantId, keyName);
            res.status(201).json({
                success: true,
                message: 'API Key generated successfully. Save this secret key as it will not be shown again.',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const merchantId = req.merchant!.id;
            const profile = await merchantService.getMerchantProfile(merchantId);
            res.status(200).json({
                success: true,
                data: profile
            });
        } catch (error) {
            next(error);
        }
    }

    async getLedger(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const merchantId = req.merchant!.id;
            const ledger = await merchantService.getMerchantLedger(merchantId);
            res.status(200).json({
                success: true,
                data: ledger
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new MerchantController();
