import { v4 as uuidv4 } from 'uuid';
import sequelize from '../database/models/sequelize';
import paymentRepository from '../repositories/payment.repository';
import refundRepository from '../repositories/refund.repository';
import merchantRepository from '../repositories/merchant.repository';
import ledgerRepository from '../repositories/ledger.repository';
import { PaymentStatus } from '../database/models/payment';
import { RefundStatus } from '../database/models/refund';
import { LedgerEntryType, LedgerReferenceType } from '../database/models/ledgerEntry';
import { CreateRefundInput } from '../validators/refund.validator';
import { NotFoundError, BadRequestError } from '../shared/errors/appError';
import { rupeesToPaise, paiseToRupees } from '../shared/utils/money';

export class RefundService {
    async processRefund(merchantId: string, input: CreateRefundInput) {
        return await sequelize.transaction(async (transaction) => {
            const lockOptions = transaction?.LOCK?.UPDATE ? { lock: transaction.LOCK.UPDATE } : undefined;

            // 1. Fetch & validate payment
            const payment = await paymentRepository.findById(input.payment_id, lockOptions, transaction);
            if (!payment || payment.merchant_id !== merchantId) {
                throw new NotFoundError('Payment not found', 'PAYMENT_NOT_FOUND');
            }

            // A payment cannot be refunded before it reaches SUCCESS
            if (payment.status !== PaymentStatus.SUCCESS) {
                throw new BadRequestError(`Cannot refund payment with status '${payment.status}'. Only SUCCESS payments can be refunded.`);
            }

            const refundAmountPaise = rupeesToPaise(input.amount);

            // 2. Validate refund amount against remaining refundable payment amount
            const totalRefundedPaise = await refundRepository.getTotalSuccessfulRefundsForPayment(payment.id, transaction);
            const remainingRefundablePaise = Number(payment.amount) - totalRefundedPaise;

            if (refundAmountPaise > remainingRefundablePaise) {
                throw new BadRequestError(
                    `Requested refund amount (${paiseToRupees(refundAmountPaise)} INR) exceeds remaining refundable amount (${paiseToRupees(remainingRefundablePaise)} INR)`
                );
            }

            // 3. Validate merchant balance
            const merchant = await merchantRepository.findById(merchantId, lockOptions, transaction);
            if (!merchant || Number(merchant.balance) < refundAmountPaise) {
                throw new BadRequestError('Insufficient merchant balance to cover refund');
            }

            const refundRef = `ref_${uuidv4().replace(/-/g, '').substring(0, 12)}`;

            // 4. Create Refund record
            const refund = await refundRepository.create({
                payment_id: payment.id,
                merchant_id: merchantId,
                amount: refundAmountPaise,
                currency: payment.currency,
                status: RefundStatus.SUCCESS,
                reason: input.reason || 'Customer request',
                refund_reference: refundRef
            }, transaction);

            // 5. Debit Merchant Balance & Log Ledger Entry
            const updatedMerchant = await merchantRepository.updateBalance(
                merchantId,
                -refundAmountPaise,
                transaction
            );

            await ledgerRepository.create({
                merchant_id: merchantId,
                type: LedgerEntryType.DEBIT,
                amount: refundAmountPaise,
                currency: payment.currency,
                reference_type: LedgerReferenceType.REFUND,
                reference_id: refund.id,
                balance_after: updatedMerchant ? Number(updatedMerchant.balance) : 0
            }, transaction);

            return {
                id: refund.id,
                payment_id: refund.payment_id,
                amount_paise: Number(refund.amount),
                amount_rupees: paiseToRupees(Number(refund.amount)),
                currency: refund.currency,
                status: refund.status,
                reason: refund.reason,
                refund_reference: refund.refund_reference,
                createdAt: refund.createdAt
            };
        });
    }

    async getRefundById(merchantId: string, refundId: string) {
        const refund = await refundRepository.findById(refundId);
        if (!refund || refund.merchant_id !== merchantId) {
            throw new NotFoundError('Refund transaction not found', 'REFUND_NOT_FOUND');
        }

        return {
            id: refund.id,
            payment_id: refund.payment_id,
            merchant_id: refund.merchant_id,
            amount_paise: Number(refund.amount),
            amount_rupees: paiseToRupees(Number(refund.amount)),
            currency: refund.currency,
            status: refund.status,
            reason: refund.reason,
            refund_reference: refund.refund_reference,
            createdAt: refund.createdAt
        };
    }
}

export default new RefundService();
