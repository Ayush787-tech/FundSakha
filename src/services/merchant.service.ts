import crypto from 'crypto';
import merchantRepository from '../repositories/merchant.repository';
import apiKeyRepository from '../repositories/apiKey.repository';
import ledgerRepository from '../repositories/ledger.repository';
import { hashApiKey } from '../middlewares/auth.middleware';
import { NotFoundError } from '../shared/errors/appError';
import { paiseToRupees } from '../shared/utils/money';

export class MerchantService {
    async createApiKey(merchantId: string, name: string) {
        const randomBytes = crypto.randomBytes(24).toString('hex');
        const rawApiKey = `pk_live_${randomBytes}`;
        const prefix = rawApiKey.substring(0, 12);
        const keyHash = hashApiKey(rawApiKey);

        const apiKeyRecord = await apiKeyRepository.create({
            merchant_id: merchantId,
            name: name || 'API Key',
            prefix,
            key_hash: keyHash,
        });

        return {
            id: apiKeyRecord.id,
            name: apiKeyRecord.name,
            prefix: apiKeyRecord.prefix,
            apiKey: rawApiKey, // Secret returned only once
            status: apiKeyRecord.status,
            createdAt: apiKeyRecord.createdAt
        };
    }

    async getMerchantProfile(merchantId: string) {
        const merchant = await merchantRepository.findById(merchantId);
        if (!merchant) {
            throw new NotFoundError('Merchant profile not found', 'MERCHANT_NOT_FOUND');
        }

        const apiKeys = await apiKeyRepository.findByMerchantId(merchantId);

        return {
            id: merchant.id,
            name: merchant.name,
            email: merchant.email,
            balance_paise: Number(merchant.balance),
            balance_rupees: paiseToRupees(Number(merchant.balance)),
            status: merchant.status,
            apiKeys: apiKeys.map(k => ({
                id: k.id,
                name: k.name,
                prefix: k.prefix,
                status: k.status,
                createdAt: k.createdAt
            })),
            createdAt: merchant.createdAt
        };
    }

    async getMerchantLedger(merchantId: string) {
        const entries = await ledgerRepository.findByMerchantId(merchantId);
        return entries.map(e => ({
            id: e.id,
            type: e.type,
            amount_paise: Number(e.amount),
            amount_rupees: paiseToRupees(Number(e.amount)),
            currency: e.currency,
            reference_type: e.reference_type,
            reference_id: e.reference_id,
            balance_after_paise: Number(e.balance_after),
            balance_after_rupees: paiseToRupees(Number(e.balance_after)),
            createdAt: e.createdAt
        }));
    }
}

export default new MerchantService();
