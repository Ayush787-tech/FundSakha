import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from './sequelize';
import Merchant from './merchant';
import Payment from './payment';

export enum RefundStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED'
}

export class Refund extends Model<InferAttributes<Refund>, InferCreationAttributes<Refund>> {
    declare id: CreationOptional<string>;
    declare payment_id: ForeignKey<string>;
    declare merchant_id: ForeignKey<string>;
    declare amount: number; // Stored in integer paise
    declare currency: CreationOptional<string>;
    declare status: CreationOptional<RefundStatus>;
    declare reason: CreationOptional<string>;
    declare refund_reference: CreationOptional<string>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Refund.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        payment_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: Payment,
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
        status: {
            type: DataTypes.ENUM(...Object.values(RefundStatus)),
            allowNull: false,
            defaultValue: RefundStatus.PENDING,
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        refund_reference: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'refunds',
        timestamps: true,
    }
);

Payment.hasMany(Refund, { foreignKey: 'payment_id', as: 'refunds' });
Refund.belongsTo(Payment, { foreignKey: 'payment_id', as: 'payment' });

Merchant.hasMany(Refund, { foreignKey: 'merchant_id', as: 'refunds' });
Refund.belongsTo(Merchant, { foreignKey: 'merchant_id', as: 'merchant' });

export default Refund;
