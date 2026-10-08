import { Transaction } from 'sequelize';
import { BaseRepository } from './base.repository';
import ApiKey, { ApiKeyStatus } from '../database/models/apiKey';
import Merchant from '../database/models/merchant';

export class ApiKeyRepository extends BaseRepository<ApiKey> {
    constructor() {
        super(ApiKey);
    }

    async findActiveByKeyHash(keyHash: string, transaction?: Transaction): Promise<ApiKey | null> {
        return await this.findOne({
            where: {
                key_hash: keyHash,
                status: ApiKeyStatus.ACTIVE
            },
            include: [{ model: Merchant, as: 'merchant' }]
        }, transaction);
    }

    async findByMerchantId(merchant_id: string, transaction?: Transaction): Promise<ApiKey[]> {
        return await this.findAll({
            where: { merchant_id }
        }, transaction);
    }
}

export default new ApiKeyRepository();
