import { Transaction } from 'sequelize';
import { BaseRepository } from './base.repository';
import Refund, { RefundStatus } from '../database/models/refund';

export class RefundRepository extends BaseRepository<Refund> {
    constructor() {
        super(Refund);
    }

    async findByPaymentId(payment_id: string, transaction?: Transaction): Promise<Refund[]> {
        return await this.findAll({
            where: { payment_id },
            order: [['createdAt', 'DESC']]
        }, transaction);
    }

    async getTotalSuccessfulRefundsForPayment(payment_id: string, transaction?: Transaction): Promise<number> {
        const refunds = await this.findAll({
            where: {
                payment_id,
                status: RefundStatus.SUCCESS
            }
        }, transaction);

        return refunds.reduce((sum, r) => sum + Number(r.amount), 0);
    }
}

export default new RefundRepository();
