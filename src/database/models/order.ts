import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from './sequelize';
import Merchant from './merchant';

export enum OrderStatus {
    CREATED = 'CREATED',
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED'
}

export class Order extends Model<InferAttributes<Order>, InferCreationAttributes<Order>> {
    declare id: CreationOptional<string>;
    declare merchant_id: ForeignKey<string>;
    declare merchant_order_id: string;
    declare amount: number; // Stored in integer paise
    declare currency: CreationOptional<string>;
    declare status: CreationOptional<OrderStatus>;
    declare description: CreationOptional<string>;
    declare customer_email: CreationOptional<string>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Order.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        merchant_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: Merchant,
                key: 'id',
            },
        },
        merchant_order_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        amount: {
            type: DataTypes.BIGINT,
            allowNull: false,
            get() {
                const rawValue = this.getDataValue('amount');
                return rawValue ? parseInt(rawValue as any, 10) : 0;
            }
        },
        currency: {
            type: DataTypes.STRING(3),
            allowNull: false,
            defaultValue: 'INR',
        },
        status: {
            type: DataTypes.ENUM(...Object.values(OrderStatus)),
            allowNull: false,
            defaultValue: OrderStatus.CREATED,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        customer_email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'orders',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['merchant_id', 'merchant_order_id']
            }
        ]
    }
);

Merchant.hasMany(Order, { foreignKey: 'merchant_id', as: 'orders' });
Order.belongsTo(Merchant, { foreignKey: 'merchant_id', as: 'merchant' });

export default Order;
