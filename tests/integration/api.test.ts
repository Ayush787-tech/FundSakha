import request from 'supertest';
import app from '../../src/app';
import sequelize from '../../src/database/models/sequelize';
import merchantRepository from '../../src/repositories/merchant.repository';
import apiKeyRepository from '../../src/repositories/apiKey.repository';
import orderRepository from '../../src/repositories/order.repository';
import paymentRepository from '../../src/repositories/payment.repository';
import refundRepository from '../../src/repositories/refund.repository';
import ledgerRepository from '../../src/repositories/ledger.repository';
import { MerchantStatus } from '../../src/database/models/merchant';
import { ApiKeyStatus } from '../../src/database/models/apiKey';
import { OrderStatus } from '../../src/database/models/order';
import { PaymentStatus, PaymentMethod } from '../../src/database/models/payment';
import { RefundStatus } from '../../src/database/models/refund';
import { hashApiKey } from '../../src/middlewares/auth.middleware';

describe('Payment Gateway End-to-End API Integration Tests', () => {
    let merchantJwtToken: string;
    let rawApiKey: string;
    let orderId: string;
    let paymentId: string;

    const mockMerchant = {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Test Merchant',
        email: 'testmerchant@gateway.com',
        password_hash: '$2a$10$e8w8GZp5K8mK3z1KqJzOue5nN2X0.K.1p5yJz1.K.1p5yJz1.K.1',
        balance: 0,
        status: MerchantStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        update: jest.fn().mockImplementation(function(this: any, data: any) {
            Object.assign(this, data);
            return Promise.resolve(this);
        })
    };

    beforeEach(() => {
        jest.spyOn(sequelize, 'transaction').mockImplementation(async (cb: any) => cb({}));
        jest.spyOn(sequelize, 'authenticate').mockResolvedValue();

        rawApiKey = 'pk_live_1234567890abcdef1234567890abcdef1234567890abcdef';
        const keyHash = hashApiKey(rawApiKey);

        jest.spyOn(apiKeyRepository, 'findActiveByKeyHash').mockResolvedValue({
            id: 'key-123',
            merchant_id: mockMerchant.id,
            key_hash: keyHash,
            prefix: 'pk_live_123',
            name: 'Live Key',
            status: ApiKeyStatus.ACTIVE,
            merchant: mockMerchant as any
        } as any);

        jest.spyOn(merchantRepository, 'findById').mockResolvedValue(mockMerchant as any);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('POST /api/v1/auth/register', () => {
        it('should register a new merchant and return JWT', async () => {
            jest.spyOn(merchantRepository, 'findByEmail').mockResolvedValue(null);
            jest.spyOn(merchantRepository, 'create').mockResolvedValue(mockMerchant as any);

            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Test Merchant',
                    email: 'testmerchant@gateway.com',
                    password: 'password123'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.token).toBeDefined();
            expect(res.body.data.merchant.email).toBe('testmerchant@gateway.com');
            
            merchantJwtToken = res.body.data.token;
        });

        it('should fail with 400 on invalid email', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Bad Merchant',
                    email: 'invalid-email',
                    password: '123'
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error.code).toBe('VALIDATION_ERROR');
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should authenticate merchant and return JWT', async () => {
            const bcrypt = require('bcryptjs');
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
            jest.spyOn(merchantRepository, 'findByEmail').mockResolvedValue(mockMerchant as any);

            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'testmerchant@gateway.com',
                    password: 'password123'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.token).toBeDefined();
        });
    });

    describe('POST /api/v1/merchants/api-keys', () => {
        it('should generate a secret API Key for merchant', async () => {
            jest.spyOn(apiKeyRepository, 'create').mockImplementation((data: any) => Promise.resolve({
                id: 'key-123',
                name: data.name,
                prefix: data.prefix,
                key_hash: data.key_hash,
                status: ApiKeyStatus.ACTIVE,
                createdAt: new Date()
            } as any));

            const res = await request(app)
                .post('/api/v1/merchants/api-keys')
                .set('Authorization', `Bearer ${merchantJwtToken}`)
                .send({ name: 'Live Key' });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.apiKey).toMatch(/^pk_live_/);
        });

        it('should fail with 401 when JWT is missing', async () => {
            const res = await request(app)
                .post('/api/v1/merchants/api-keys')
                .send({ name: 'Live Key' });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/orders', () => {
        it('should create an order using API Key authentication', async () => {
            const mockOrder = {
                id: '22222222-2222-4222-8222-222222222222',
                merchant_id: mockMerchant.id,
                merchant_order_id: 'ORD-TEST-001',
                amount: 150000,
                currency: 'INR',
                status: OrderStatus.CREATED,
                description: 'Integration test order',
                customer_email: 'buyer@test.com',
                createdAt: new Date()
            };

            jest.spyOn(orderRepository, 'findByMerchantAndOrderId').mockResolvedValue(null);
            jest.spyOn(orderRepository, 'create').mockResolvedValue(mockOrder as any);

            const res = await request(app)
                .post('/api/v1/orders')
                .set('X-API-KEY', rawApiKey)
                .send({
                    merchant_order_id: 'ORD-TEST-001',
                    amount: 1500.00,
                    currency: 'INR',
                    description: 'Integration test order',
                    customer_email: 'buyer@test.com'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(mockOrder.id);
            expect(res.body.data.status).toBe('CREATED');

            orderId = res.body.data.id;
        });
    });

    describe('POST /api/v1/payments', () => {
        it('should process payment successfully and update order status to PAID', async () => {
            const mockOrderObj = {
                id: orderId || '22222222-2222-4222-8222-222222222222',
                merchant_id: mockMerchant.id,
                merchant_order_id: 'ORD-TEST-001',
                amount: 150000,
                currency: 'INR',
                status: OrderStatus.CREATED,
                update: jest.fn().mockImplementation(function(this: any, data: any) {
                    Object.assign(this, data);
                    return Promise.resolve(this);
                })
            };

            const mockPaymentObj = {
                id: '33333333-3333-4333-8333-333333333333',
                order_id: orderId || '22222222-2222-4222-8222-222222222222',
                merchant_id: mockMerchant.id,
                amount: 150000,
                currency: 'INR',
                payment_method: PaymentMethod.CREDIT_CARD,
                status: PaymentStatus.CREATED,
                createdAt: new Date(),
                update: jest.fn().mockImplementation(function(this: any, data: any) {
                    Object.assign(this, data);
                    return Promise.resolve(this);
                })
            };

            jest.spyOn(orderRepository, 'findById').mockResolvedValue(mockOrderObj as any);
            jest.spyOn(paymentRepository, 'create').mockResolvedValue(mockPaymentObj as any);
            jest.spyOn(merchantRepository, 'updateBalance').mockResolvedValue({
                ...mockMerchant,
                balance: 150000
            } as any);
            jest.spyOn(ledgerRepository, 'create').mockResolvedValue({} as any);

            const res = await request(app)
                .post('/api/v1/payments')
                .set('X-API-KEY', rawApiKey)
                .send({
                    order_id: orderId || '22222222-2222-4222-8222-222222222222',
                    payment_method: 'CREDIT_CARD',
                    details: {
                        cardNumber: '4111111111111111',
                        expiryMonth: '12',
                        expiryYear: '28',
                        cvv: '123'
                    }
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('SUCCESS');
            expect(res.body.data.transaction_id).toBeDefined();

            paymentId = res.body.data.id;
        });
    });

    describe('POST /api/v1/refunds', () => {
        it('should process refund and debit merchant balance', async () => {
            const mockPaymentObj = {
                id: paymentId || '33333333-3333-4333-8333-333333333333',
                order_id: orderId || '22222222-2222-4222-8222-222222222222',
                merchant_id: mockMerchant.id,
                amount: 150000,
                currency: 'INR',
                status: PaymentStatus.SUCCESS
            };

            const mockRefundObj = {
                id: '44444444-4444-4444-8444-444444444444',
                payment_id: paymentId || '33333333-3333-4333-8333-333333333333',
                merchant_id: mockMerchant.id,
                amount: 50000,
                currency: 'INR',
                status: RefundStatus.SUCCESS,
                reason: 'Customer return',
                refund_reference: 'ref_12345678',
                createdAt: new Date()
            };

            jest.spyOn(paymentRepository, 'findById').mockResolvedValue(mockPaymentObj as any);
            jest.spyOn(refundRepository, 'getTotalSuccessfulRefundsForPayment').mockResolvedValue(0);
            jest.spyOn(merchantRepository, 'findById').mockResolvedValue({
                ...mockMerchant,
                balance: 150000
            } as any);
            jest.spyOn(refundRepository, 'create').mockResolvedValue(mockRefundObj as any);
            jest.spyOn(merchantRepository, 'updateBalance').mockResolvedValue({
                ...mockMerchant,
                balance: 100000
            } as any);
            jest.spyOn(ledgerRepository, 'create').mockResolvedValue({} as any);

            const res = await request(app)
                .post('/api/v1/refunds')
                .set('X-API-KEY', rawApiKey)
                .send({
                    payment_id: paymentId || '33333333-3333-4333-8333-333333333333',
                    amount: 500.00,
                    reason: 'Customer return'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.amount_rupees).toBe(500);
            expect(res.body.data.status).toBe('SUCCESS');
        });

        it('should fail with 400 when refund amount exceeds payment amount', async () => {
            const mockPaymentObj = {
                id: paymentId || '33333333-3333-4333-8333-333333333333',
                amount: 150000,
                status: PaymentStatus.SUCCESS,
                merchant_id: mockMerchant.id
            };

            jest.spyOn(paymentRepository, 'findById').mockResolvedValue(mockPaymentObj as any);
            jest.spyOn(refundRepository, 'getTotalSuccessfulRefundsForPayment').mockResolvedValue(120000);
            jest.spyOn(merchantRepository, 'findById').mockResolvedValue({
                ...mockMerchant,
                balance: 150000
            } as any);

            const res = await request(app)
                .post('/api/v1/refunds')
                .set('X-API-KEY', rawApiKey)
                .send({
                    payment_id: paymentId || '33333333-3333-4333-8333-333333333333',
                    amount: 500.00
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error.message).toContain('exceeds remaining refundable amount');
        });
    });
});
