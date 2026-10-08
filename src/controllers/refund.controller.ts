import { Request, Response, NextFunction } from 'express';
import refundService from '../services/refund.service';

export class RefundController {
    async processRefund(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const merchantId = req.merchant!.id;
            const refund = await refundService.processRefund(merchantId, req.body);
            res.status(201).json({
                success: true,
                message: 'Refund processed successfully',
                data: refund
            });
        } catch (error) {
            next(error);
        }
    }

    async getRefundById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const merchantId = req.merchant!.id;
            const refundId = req.params.id as string;
            const refund = await refundService.getRefundById(merchantId, refundId);
            res.status(200).json({
                success: true,
                data: refund
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new RefundController();
