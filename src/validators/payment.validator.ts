import { z } from 'zod';
import { PaymentMethod } from '../database/models/payment';

export const createPaymentSchema = z.object({
    order_id: z.string().uuid('Valid order_id UUID is required'),
    payment_method: z.nativeEnum(PaymentMethod, {
        errorMap: () => ({ message: 'Invalid payment_method. Allowed: CREDIT_CARD, UPI, NETBANKING, MOCK_WALLET' })
    }),
    details: z.object({
        cardNumber: z.string().optional(),
        expiryMonth: z.string().optional(),
        expiryYear: z.string().optional(),
        cvv: z.string().optional(),
        cardHolderName: z.string().optional(),
        upiId: z.string().optional(),
        bankCode: z.string().optional(),
        walletId: z.string().optional(),
        simulateFailure: z.boolean().optional(),
        failureReason: z.string().optional()
    }).optional()
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
