import orderRepository from '../repositories/order.repository';
import paymentRepository from '../repositories/payment.repository';
import { CreateOrderInput } from '../validators/order.validator';
import { ConflictError, NotFoundError } from '../shared/errors/appError';
import { rupeesToPaise, paiseToRupees } from '../shared/utils/money';

export class OrderService {
    async createOrder(merchantId: string, input: CreateOrderInput) {
        const existingOrder = await orderRepository.findByMerchantAndOrderId(merchantId, input.merchant_order_id);
        if (existingOrder) {
            throw new ConflictError(`Order with merchant_order_id '${input.merchant_order_id}' already exists`);
        }

        // Store amount in integer paise to avoid float rounding errors
        const amountInPaise = rupeesToPaise(input.amount);

        const order = await orderRepository.create({
            merchant_id: merchantId,
            merchant_order_id: input.merchant_order_id,
            amount: amountInPaise,
            currency: input.currency || 'INR',
            description: input.description,
            customer_email: input.customer_email,
        });

        return {
            id: order.id,
            merchant_id: order.merchant_id,
            merchant_order_id: order.merchant_order_id,
            amount_paise: Number(order.amount),
            amount_rupees: paiseToRupees(Number(order.amount)),
            currency: order.currency,
            status: order.status,
            description: order.description,
            customer_email: order.customer_email,
            createdAt: order.createdAt
        };
    }

    async getOrderById(merchantId: string, orderId: string) {
        const order = await orderRepository.findById(orderId);
        if (!order || order.merchant_id !== merchantId) {
            throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
        }

        const payments = await paymentRepository.findByOrderId(order.id);

        return {
            id: order.id,
            merchant_id: order.merchant_id,
            merchant_order_id: order.merchant_order_id,
            amount_paise: Number(order.amount),
            amount_rupees: paiseToRupees(Number(order.amount)),
            currency: order.currency,
            status: order.status,
            description: order.description,
            customer_email: order.customer_email,
            payments: payments.map(p => ({
                id: p.id,
                amount_paise: Number(p.amount),
                amount_rupees: paiseToRupees(Number(p.amount)),
                currency: p.currency,
                payment_method: p.payment_method,
                status: p.status,
                transaction_id: p.transaction_id,
                gateway_reference: p.gateway_reference,
                createdAt: p.createdAt
            })),
            createdAt: order.createdAt
        };
    }

    async listOrders(merchantId: string) {
        const orders = await orderRepository.findByMerchantId(merchantId);
        return orders.map(order => ({
            id: order.id,
            merchant_order_id: order.merchant_order_id,
            amount_paise: Number(order.amount),
            amount_rupees: paiseToRupees(Number(order.amount)),
            currency: order.currency,
            status: order.status,
            customer_email: order.customer_email,
            createdAt: order.createdAt
        }));
    }
}

export default new OrderService();
