import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from './sequelize';

export enum MerchantStatus {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED'
}

export class Merchant extends Model<InferAttributes<Merchant>, InferCreationAttributes<Merchant>> {
    declare id: CreationOptional<string>;
    declare name: string;
    declare email: string;
    declare password_hash: string;
    declare balance: CreationOptional<number>; // Stored in integer paise (e.g., 50000 = ₹500.00)
    declare status: CreationOptional<MerchantStatus>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Merchant.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        balance: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
            get() {
                const rawValue = this.getDataValue('balance');
                return rawValue ? parseInt(rawValue as any, 10) : 0;
            }
        },
        status: {
            type: DataTypes.ENUM(...Object.values(MerchantStatus)),
            allowNull: false,
            defaultValue: MerchantStatus.ACTIVE,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'merchants',
        timestamps: true,
    }
);

export default Merchant;
