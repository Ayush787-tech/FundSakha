import { Request, Response, NextFunction } from 'express';
import paymentService from '../services/payment.service';

export class PaymentController {
    async processPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const merchantId = req.merchant!.id;
            const payment = await paymentService.processPayment(merchantId, req.body);
            const statusCode = payment.status === 'SUCCESS' ? 200 : 402;
            res.status(statusCode).json({
                success: payment.status === 'SUCCESS',
                message: payment.status === 'SUCCESS' ? 'Payment processed successfully' : 'Payment processing failed',
                data: payment
            });
        } catch (error) {
            next(error);
        }
    }

    async getPaymentById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const merchantId = req.merchant!.id;
            const paymentId = req.params.id as string;
            const payment = await paymentService.getPaymentById(merchantId, paymentId);
            res.status(200).json({
                success: true,
                data: payment
            });
        } catch (error) {
            next(error);
        }
    }

    async getPaymentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const merchantId = req.merchant!.id;
            const paymentId = req.params.id as string;
            const statusInfo = await paymentService.getPaymentStatus(merchantId, paymentId);
            res.status(200).json({
                success: true,
                data: statusInfo
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new PaymentController();
