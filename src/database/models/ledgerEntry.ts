import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from './sequelize';
import Merchant from './merchant';

export enum LedgerEntryType {
    CREDIT = 'CREDIT',
    DEBIT = 'DEBIT'
}

export enum LedgerReferenceType {
    PAYMENT = 'PAYMENT',
    REFUND = 'REFUND'
}

export class LedgerEntry extends Model<InferAttributes<LedgerEntry>, InferCreationAttributes<LedgerEntry>> {
    declare id: CreationOptional<string>;
    declare merchant_id: ForeignKey<string>;
    declare type: LedgerEntryType;
    declare amount: number; // Stored in integer paise
    declare currency: CreationOptional<string>;
    declare reference_type: LedgerReferenceType;
    declare reference_id: string;
    declare balance_after: number; // Stored in integer paise
    declare createdAt: CreationOptional<Date>;
}

LedgerEntry.init(
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
        type: {
            type: DataTypes.ENUM(...Object.values(LedgerEntryType)),
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
        reference_type: {
            type: DataTypes.ENUM(...Object.values(LedgerReferenceType)),
            allowNull: false,
        },
        reference_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        balance_after: {
            type: DataTypes.BIGINT,
            allowNull: false,
            get() {
                const rawValue = this.getDataValue('balance_after');
                return rawValue ? parseInt(rawValue as any, 10) : 0;
            }
        },
        createdAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'ledger_entries',
        timestamps: true,
        updatedAt: false,
    }
);

Merchant.hasMany(LedgerEntry, { foreignKey: 'merchant_id', as: 'ledgerEntries' });
LedgerEntry.belongsTo(Merchant, { foreignKey: 'merchant_id', as: 'merchant' });

export default LedgerEntry;
