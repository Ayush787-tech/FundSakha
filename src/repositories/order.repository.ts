import { Transaction } from 'sequelize';
import { BaseRepository } from './base.repository';
import Order from '../database/models/order';

export class OrderRepository extends BaseRepository<Order> {
    constructor() {
        super(Order);
    }

    async findByMerchantAndOrderId(merchant_id: string, merchant_order_id: string, transaction?: Transaction): Promise<Order | null> {
        return await this.findOne({
            where: { merchant_id, merchant_order_id }
        }, transaction);
    }

    async findByMerchantId(merchant_id: string, transaction?: Transaction): Promise<Order[]> {
        return await this.findAll({
            where: { merchant_id },
            order: [['createdAt', 'DESC']]
        }, transaction);
    }
}

export default new OrderRepository();
