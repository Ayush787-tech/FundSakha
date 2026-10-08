import { PaymentProcessorFactory } from '../../src/strategies/payment/paymentProcessorFactory';
import { PaymentMethod } from '../../src/database/models/payment';
import { CreditCardStrategy } from '../../src/strategies/payment/creditCardStrategy';
import { UpiStrategy } from '../../src/strategies/payment/upiStrategy';
import { NetBankingStrategy } from '../../src/strategies/payment/netBankingStrategy';
import { MockWalletStrategy } from '../../src/strategies/payment/mockWalletStrategy';
import { BadRequestError } from '../../src/shared/errors/appError';

describe('Payment Strategy & Factory Unit Tests', () => {
    describe('PaymentProcessorFactory', () => {
        it('should return CreditCardStrategy for CREDIT_CARD method', () => {
            const processor = PaymentProcessorFactory.getProcessor(PaymentMethod.CREDIT_CARD);
            expect(processor).toBeInstanceOf(CreditCardStrategy);
        });

        it('should return UpiStrategy for UPI method', () => {
            const processor = PaymentProcessorFactory.getProcessor(PaymentMethod.UPI);
            expect(processor).toBeInstanceOf(UpiStrategy);
        });

        it('should return NetBankingStrategy for NETBANKING method', () => {
            const processor = PaymentProcessorFactory.getProcessor(PaymentMethod.NETBANKING);
            expect(processor).toBeInstanceOf(NetBankingStrategy);
        });

        it('should return MockWalletStrategy for MOCK_WALLET method', () => {
            const processor = PaymentProcessorFactory.getProcessor(PaymentMethod.MOCK_WALLET);
            expect(processor).toBeInstanceOf(MockWalletStrategy);
        });

        it('should throw BadRequestError for invalid payment method', () => {
            expect(() => PaymentProcessorFactory.getProcessor('INVALID_METHOD' as any)).toThrow(BadRequestError);
        });
    });

    describe('CreditCardStrategy', () => {
        const strategy = new CreditCardStrategy();

        it('should successfully process valid card payment', async () => {
            const result = await strategy.process({
                amount: 1000,
                currency: 'INR',
                orderId: 'ord-123',
                merchantId: 'mch-123',
                paymentMethod: PaymentMethod.CREDIT_CARD,
                details: { cardNumber: '4111111111111111', expiryMonth: '12', expiryYear: '28', cvv: '123' }
            });

            expect(result.success).toBe(true);
            expect(result.transactionId).toMatch(/^txn_cc_/);
            expect(result.metadata?.cardBrand).toBe('VISA');
        });

        it('should fail if card ends with 0000', async () => {
            const result = await strategy.process({
                amount: 1000,
                currency: 'INR',
                orderId: 'ord-123',
                merchantId: 'mch-123',
                paymentMethod: PaymentMethod.CREDIT_CARD,
                details: { cardNumber: '4111111111110000' }
            });

            expect(result.success).toBe(false);
            expect(result.errorCode).toBe('INSUFFICIENT_FUNDS');
        });

        it('should fail if card number is too short', async () => {
            const result = await strategy.process({
                amount: 1000,
                currency: 'INR',
                orderId: 'ord-123',
                merchantId: 'mch-123',
                paymentMethod: PaymentMethod.CREDIT_CARD,
                details: { cardNumber: '12345' }
            });

            expect(result.success).toBe(false);
            expect(result.errorCode).toBe('INVALID_CARD_NUMBER');
        });
    });

    describe('UpiStrategy', () => {
        const strategy = new UpiStrategy();

        it('should successfully process valid UPI payment', async () => {
            const result = await strategy.process({
                amount: 500,
                currency: 'INR',
                orderId: 'ord-123',
                merchantId: 'mch-123',
                paymentMethod: PaymentMethod.UPI,
                details: { upiId: 'user@okicici' }
            });

            expect(result.success).toBe(true);
            expect(result.transactionId).toMatch(/^txn_upi_/);
        });

        it('should fail if UPI VPA format is invalid', async () => {
            const result = await strategy.process({
                amount: 500,
                currency: 'INR',
                orderId: 'ord-123',
                merchantId: 'mch-123',
                paymentMethod: PaymentMethod.UPI,
                details: { upiId: 'invalid-upi-id' }
            });

            expect(result.success).toBe(false);
            expect(result.errorCode).toBe('INVALID_UPI_ID');
        });
    });

    describe('NetBankingStrategy', () => {
        const strategy = new NetBankingStrategy();

        it('should successfully process supported bank', async () => {
            const result = await strategy.process({
                amount: 2500,
                currency: 'INR',
                orderId: 'ord-123',
                merchantId: 'mch-123',
                paymentMethod: PaymentMethod.NETBANKING,
                details: { bankCode: 'HDFC' }
            });

            expect(result.success).toBe(true);
            expect(result.gatewayReference).toMatch(/^HDFC_REF_/);
        });

        it('should fail for unsupported bank code', async () => {
            const result = await strategy.process({
                amount: 2500,
                currency: 'INR',
                orderId: 'ord-123',
                merchantId: 'mch-123',
                paymentMethod: PaymentMethod.NETBANKING,
                details: { bankCode: 'UNKNOWN_BANK' }
            });

            expect(result.success).toBe(false);
            expect(result.errorCode).toBe('UNSUPPORTED_BANK');
        });
    });
});
