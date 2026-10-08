import { z } from 'zod';

export const createRefundSchema = z.object({
    payment_id: z.string().uuid('Valid payment_id UUID is required'),
    amount: z.number().positive('Refund amount must be greater than 0'),
    reason: z.string().optional()
});

export type CreateRefundInput = z.infer<typeof createRefundSchema>;
