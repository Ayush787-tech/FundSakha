import sequelize from '../database/models/sequelize';
import orderRepository from '../repositories/order.repository';
import paymentRepository from '../repositories/payment.repository';
import merchantRepository from '../repositories/merchant.repository';
import ledgerRepository from '../repositories/ledger.repository';
import { PaymentProcessorFactory } from '../strategies/payment/paymentProcessorFactory';
import { PaymentStatus } from '../database/models/payment';
import { OrderStatus } from '../database/models/order';
import { LedgerEntryType, LedgerReferenceType } from '../database/models/ledgerEntry';
import { CreatePaymentInput } from '../validators/payment.validator';
import { NotFoundError, ConflictError } from '../shared/errors/appError';
import { paiseToRupees } from '../shared/utils/money';

export class PaymentService {
    async processPayment(merchantId: string, input: CreatePaymentInput) {
        return await sequelize.transaction(async (transaction) => {
            // 1. Fetch & validate order with pessimistic row lock to prevent concurrent double-payments
            const lockOptions = transaction?.LOCK?.UPDATE ? { lock: transaction.LOCK.UPDATE } : undefined;
            const order = await orderRepository.findById(input.order_id, lockOptions, transaction);
            if (!order || order.merchant_id !== merchantId) {
                throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
            }

            if (order.status === OrderStatus.PAID) {
                throw new ConflictError('Order has already been paid');
            }

            if (order.status === OrderStatus.CANCELLED) {
                throw new ConflictError('Order is cancelled and cannot be paid');
            }

            // 2. Resolve strategy
            const processor = PaymentProcessorFactory.getProcessor(input.payment_method);

            // 3. Create initial payment record in CREATED state
            const payment = await paymentRepository.create({
                order_id: order.id,
                merchant_id: merchantId,
                amount: Number(order.amount),
                currency: order.currency,
                payment_method: input.payment_method,
                status: PaymentStatus.CREATED
            }, transaction);

            // 4. Transition to PROCESSING state
            await payment.update({ status: PaymentStatus.PROCESSING }, { transaction });

            // 5. Process payment via Strategy Pattern
            const result = await processor.process({
                amount: Number(order.amount),
                currency: order.currency,
                orderId: order.id,
                merchantId,
                paymentMethod: input.payment_method,
                details: input.details
            });

            if (result.success) {
                // 6a. Update Payment status to SUCCESS
                await payment.update({
                    status: PaymentStatus.SUCCESS,
                    transaction_id: result.transactionId,
                    gateway_reference: result.gatewayReference,
                    metadata: result.metadata
                }, { transaction });

                // 6b. Update Order status to PAID
                await order.update({ status: OrderStatus.PAID }, { transaction });

                // 6c. Credit Merchant Balance & Log Ledger Entry
                const updatedMerchant = await merchantRepository.updateBalance(
                    merchantId,
                    Number(order.amount),
                    transaction
                );

                await ledgerRepository.create({
                    merchant_id: merchantId,
                    type: LedgerEntryType.CREDIT,
                    amount: Number(order.amount),
                    currency: order.currency,
                    reference_type: LedgerReferenceType.PAYMENT,
                    reference_id: payment.id,
                    balance_after: updatedMerchant ? Number(updatedMerchant.balance) : 0
                }, transaction);

                return {
                    id: payment.id,
                    order_id: payment.order_id,
                    amount_paise: Number(payment.amount),
                    amount_rupees: paiseToRupees(Number(payment.amount)),
                    currency: payment.currency,
                    payment_method: payment.payment_method,
                    status: PaymentStatus.SUCCESS,
                    transaction_id: result.transactionId,
                    gateway_reference: result.gatewayReference,
                    metadata: result.metadata,
                    createdAt: payment.createdAt
                };
            } else {
                // 6d. Update Payment status to FAILED
                await payment.update({
                    status: PaymentStatus.FAILED,
                    transaction_id: result.transactionId,
                    gateway_reference: result.gatewayReference,
                    failure_reason: result.errorMessage
                }, { transaction });

                return {
                    id: payment.id,
                    order_id: payment.order_id,
                    amount_paise: Number(payment.amount),
                    amount_rupees: paiseToRupees(Number(payment.amount)),
                    currency: payment.currency,
                    payment_method: payment.payment_method,
                    status: PaymentStatus.FAILED,
                    transaction_id: result.transactionId,
                    gateway_reference: result.gatewayReference,
                    failure_reason: result.errorMessage,
                    createdAt: payment.createdAt
                };
            }
        });
    }

    async getPaymentById(merchantId: string, paymentId: string) {
        const payment = await paymentRepository.findById(paymentId);
        if (!payment || payment.merchant_id !== merchantId) {
            throw new NotFoundError('Payment transaction not found', 'PAYMENT_NOT_FOUND');
        }

        return {
            id: payment.id,
            order_id: payment.order_id,
            merchant_id: payment.merchant_id,
            amount_paise: Number(payment.amount),
            amount_rupees: paiseToRupees(Number(payment.amount)),
            currency: payment.currency,
            payment_method: payment.payment_method,
            status: payment.status,
            transaction_id: payment.transaction_id,
            gateway_reference: payment.gateway_reference,
            failure_reason: payment.failure_reason,
            metadata: payment.metadata,
            createdAt: payment.createdAt
        };
    }

    async getPaymentStatus(merchantId: string, paymentId: string) {
        const payment = await paymentRepository.findById(paymentId);
        if (!payment || payment.merchant_id !== merchantId) {
            throw new NotFoundError('Payment does not exist', 'PAYMENT_NOT_FOUND');
        }

        return {
            payment_id: payment.id,
            order_id: payment.order_id,
            status: payment.status,
            transaction_id: payment.transaction_id,
            updatedAt: payment.updatedAt
        };
    }
}

export default new PaymentService();
