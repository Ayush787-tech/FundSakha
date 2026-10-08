import { z } from 'zod';

export const createApiKeySchema = z.object({
    name: z.string().min(2, 'Key name must be at least 2 characters long').default('Default API Key'),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
