import { Transaction } from 'sequelize';
import { BaseRepository } from './base.repository';
import LedgerEntry from '../database/models/ledgerEntry';

export class LedgerRepository extends BaseRepository<LedgerEntry> {
    constructor() {
        super(LedgerEntry);
    }

    async findByMerchantId(merchant_id: string, transaction?: Transaction): Promise<LedgerEntry[]> {
        return await this.findAll({
            where: { merchant_id },
            order: [['createdAt', 'DESC']]
        }, transaction);
    }
}

export default new LedgerRepository();
