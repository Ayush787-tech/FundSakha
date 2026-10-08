import { PaymentStrategy, PaymentProcessInput, PaymentProcessResult } from './paymentStrategy.interface';
import { v4 as uuidv4 } from 'uuid';

export class CreditCardStrategy implements PaymentStrategy {
    async process(input: PaymentProcessInput): Promise<PaymentProcessResult> {
        const { details, amount, currency } = input;

        if (details?.simulateFailure) {
            return {
                success: false,
                transactionId: `txn_cc_${uuidv4().substring(0, 8)}`,
                gatewayReference: `gw_cc_${Date.now()}`,
                errorCode: 'CARD_DECLINED',
                errorMessage: details.failureReason || 'Simulated card processor decline'
            };
        }

        const cardNumber = details?.cardNumber?.replace(/\s+/g, '') || '';
        
        // Basic card validation rules for simulator
        if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
            return {
                success: false,
                transactionId: `txn_cc_${uuidv4().substring(0, 8)}`,
                gatewayReference: `gw_cc_${Date.now()}`,
                errorCode: 'INVALID_CARD_NUMBER',
                errorMessage: 'Card number must be between 13 and 19 digits'
            };
        }

        if (cardNumber.endsWith('0000')) {
            return {
                success: false,
                transactionId: `txn_cc_${uuidv4().substring(0, 8)}`,
                gatewayReference: `gw_cc_${Date.now()}`,
                errorCode: 'INSUFFICIENT_FUNDS',
                errorMessage: 'Insufficient funds on credit card'
            };
        }

        const txnId = `txn_cc_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
        const gwRef = `gw_visa_${Date.now()}`;

        return {
            success: true,
            transactionId: txnId,
            gatewayReference: gwRef,
            metadata: {
                cardLast4: cardNumber.slice(-4),
                cardBrand: this.detectCardBrand(cardNumber),
                processedAmount: amount,
                processedCurrency: currency
            }
        };
    }

    private detectCardBrand(cardNumber: string): string {
        if (cardNumber.startsWith('4')) return 'VISA';
        if (cardNumber.startsWith('5')) return 'MASTERCARD';
        if (cardNumber.startsWith('3')) return 'AMEX';
        return 'GENERIC_CREDIT_CARD';
    }
}
