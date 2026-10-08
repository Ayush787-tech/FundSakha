import { Transaction } from 'sequelize';
import { BaseRepository } from './base.repository';
import Merchant from '../database/models/merchant';

export class MerchantRepository extends BaseRepository<Merchant> {
    constructor() {
        super(Merchant);
    }

    async findByEmail(email: string, transaction?: Transaction): Promise<Merchant | null> {
        return await this.findOne({ where: { email } }, transaction);
    }

    async updateBalance(merchantId: string, amountDelta: number, transaction?: Transaction): Promise<Merchant | null> {
        const lockOptions = transaction?.LOCK?.UPDATE ? { lock: transaction.LOCK.UPDATE } : undefined;
        const merchant = await this.findById(merchantId, lockOptions, transaction);
        if (!merchant) return null;

        const newBalance = Number(merchant.balance) + amountDelta;
        await merchant.update({ balance: newBalance }, { transaction });
        return merchant;
    }
}

export default new MerchantRepository();
