import { Transaction } from 'sequelize';
import { BaseRepository } from './base.repository';
import Payment from '../database/models/payment';
import Order from '../database/models/order';

export class PaymentRepository extends BaseRepository<Payment> {
    constructor() {
        super(Payment);
    }

    async findByTransactionId(transaction_id: string, transaction?: Transaction): Promise<Payment | null> {
        return await this.findOne({
            where: { transaction_id },
            include: [{ model: Order, as: 'order' }]
        }, transaction);
    }

    async findByOrderId(order_id: string, transaction?: Transaction): Promise<Payment[]> {
        return await this.findAll({
            where: { order_id },
            order: [['createdAt', 'DESC']]
        }, transaction);
    }
}

export default new PaymentRepository();
