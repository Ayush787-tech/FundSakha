import { z } from 'zod';

export const createOrderSchema = z.object({
    merchant_order_id: z.string().min(1, 'merchant_order_id is required'),
    amount: z.number().positive('Amount must be greater than 0'),
    currency: z.string().length(3).default('INR'),
    description: z.string().optional(),
    customer_email: z.string().email().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
