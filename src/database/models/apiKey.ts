import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from './sequelize';
import Merchant from './merchant';

export enum ApiKeyStatus {
    ACTIVE = 'ACTIVE',
    REVOKED = 'REVOKED'
}

export class ApiKey extends Model<InferAttributes<ApiKey>, InferCreationAttributes<ApiKey>> {
    declare id: CreationOptional<string>;
    declare merchant_id: ForeignKey<string>;
    declare key_hash: string;
    declare prefix: string;
    declare name: string;
    declare status: CreationOptional<ApiKeyStatus>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare merchant?: Merchant;
}

ApiKey.init(
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
        key_hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        prefix: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(ApiKeyStatus)),
            allowNull: false,
            defaultValue: ApiKeyStatus.ACTIVE,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'api_keys',
        timestamps: true,
    }
);

Merchant.hasMany(ApiKey, { foreignKey: 'merchant_id', as: 'apiKeys' });
ApiKey.belongsTo(Merchant, { foreignKey: 'merchant_id', as: 'merchant' });

export default ApiKey;
