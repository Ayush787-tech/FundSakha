import dotenv from 'dotenv';

dotenv.config();

export const serverConfig = {
    PORT: Number(process.env.PORT) || 3000,
    ENV: process.env.NODE_ENV || 'development'
};

export const dbConfig = {
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: Number(process.env.DB_PORT) || 5432,
    DB_USER: process.env.DB_USER || 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
    DB_NAME: process.env.DB_NAME || 'payment_gateway_dev',
    DB_DIALECT: 'postgres' as const
};

export const jwtConfig = {
    JWT_SECRET: process.env.JWT_SECRET || 'super-secret-jwt-key-payment-gateway-2026',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d'
};