import { PaymentStrategy, PaymentProcessInput, PaymentProcessResult } from './paymentStrategy.interface';
import { v4 as uuidv4 } from 'uuid';

export class MockWalletStrategy implements PaymentStrategy {
    async process(input: PaymentProcessInput): Promise<PaymentProcessResult> {
        const { details, amount, currency } = input;

        if (details?.simulateFailure) {
            return {
                success: false,
                transactionId: `txn_wlt_${uuidv4().substring(0, 8)}`,
                gatewayReference: `gw_wlt_${Date.now()}`,
                errorCode: 'WALLET_BALANCE_LOW',
                errorMessage: details.failureReason || 'Insufficient wallet balance'
            };
        }

        const walletId = details?.walletId || 'default_wallet';
        const txnId = `txn_wlt_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
        const gwRef = `wlt_ref_${Date.now()}`;

        return {
            success: true,
            transactionId: txnId,
            gatewayReference: gwRef,
            metadata: {
                walletId,
                processedAmount: amount,
                processedCurrency: currency
            }
        };
    }
}
