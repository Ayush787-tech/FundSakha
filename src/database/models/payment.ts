import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from './sequelize';
import Merchant from './merchant';
import Order from './order';

export enum PaymentMethod {
    CREDIT_CARD = 'CREDIT_CARD',
    UPI = 'UPI',
    NETBANKING = 'NETBANKING',
    MOCK_WALLET = 'MOCK_WALLET'
}

export enum PaymentStatus {
    CREATED = 'CREATED',
    PROCESSING = 'PROCESSING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED'
}

export class Payment extends Model<InferAttributes<Payment>, InferCreationAttributes<Payment>> {
    declare id: CreationOptional<string>;
    declare order_id: ForeignKey<string>;
    declare merchant_id: ForeignKey<string>;
    declare amount: number; // Stored in integer paise
    declare currency: CreationOptional<string>;
    declare payment_method: PaymentMethod;
    declare status: CreationOptional<PaymentStatus>;
    declare transaction_id: CreationOptional<string>;
    declare gateway_reference: CreationOptional<string>;
    declare failure_reason: CreationOptional<string>;
    declare metadata: CreationOptional<Record<string, any>>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Payment.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        order_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: Order,
                key: 'id',
            },
        },
        merchant_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: Merchant,
                key: 'id',
            },
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
        payment_method: {
            type: DataTypes.ENUM(...Object.values(PaymentMethod)),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(PaymentStatus)),
            allowNull: false,
            defaultValue: PaymentStatus.CREATED,
        },
        transaction_id: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        gateway_reference: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        failure_reason: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        metadata: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'payments',
        timestamps: true,
    }
);

Order.hasMany(Payment, { foreignKey: 'order_id', as: 'payments' });
Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Merchant.hasMany(Payment, { foreignKey: 'merchant_id', as: 'payments' });
Payment.belongsTo(Merchant, { foreignKey: 'merchant_id', as: 'merchant' });

export default Payment;
