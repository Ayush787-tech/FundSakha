import { Request, Response, NextFunction } from 'express';
import orderService from '../services/order.service';

export class OrderController {
    async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const merchantId = req.merchant!.id;
            const order = await orderService.createOrder(merchantId, req.body);
            res.status(201).json({
                success: true,
                message: 'Order created successfully',
                data: order
            });
        } catch (error) {
            next(error);
        }
    }

    async getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const merchantId = req.merchant!.id;
            const orderId = req.params.id as string;
            const order = await orderService.getOrderById(merchantId, orderId);
            res.status(200).json({
                success: true,
                data: order
            });
        } catch (error) {
            next(error);
        }
    }

    async listOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const merchantId = req.merchant!.id;
            const orders = await orderService.listOrders(merchantId);
            res.status(200).json({
                success: true,
                data: orders
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new OrderController();
