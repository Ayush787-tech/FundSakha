import { PaymentMethod } from '../../database/models/payment';
import { PaymentStrategy } from './paymentStrategy.interface';
import { CreditCardStrategy } from './creditCardStrategy';
import { UpiStrategy } from './upiStrategy';
import { NetBankingStrategy } from './netBankingStrategy';
import { MockWalletStrategy } from './mockWalletStrategy';
import { BadRequestError } from '../../shared/errors/appError';

export class PaymentProcessorFactory {
    private static strategies: Map<PaymentMethod, PaymentStrategy> = new Map([
        [PaymentMethod.CREDIT_CARD, new CreditCardStrategy()],
        [PaymentMethod.UPI, new UpiStrategy()],
        [PaymentMethod.NETBANKING, new NetBankingStrategy()],
        [PaymentMethod.MOCK_WALLET, new MockWalletStrategy()],
    ]);

    public static getProcessor(method: PaymentMethod): PaymentStrategy {
        const strategy = this.strategies.get(method);
        if (!strategy) {
            throw new BadRequestError(`Unsupported payment method: ${method}`);
        }
        return strategy;
    }
}
