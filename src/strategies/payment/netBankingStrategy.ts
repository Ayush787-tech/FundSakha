import { PaymentStrategy, PaymentProcessInput, PaymentProcessResult } from './paymentStrategy.interface';
import { v4 as uuidv4 } from 'uuid';

export class NetBankingStrategy implements PaymentStrategy {
    private supportedBanks = ['HDFC', 'ICICI', 'SBI', 'AXIS', 'KOTAK', 'PNB'];

    async process(input: PaymentProcessInput): Promise<PaymentProcessResult> {
        const { details, amount, currency } = input;

        if (details?.simulateFailure) {
            return {
                success: false,
                transactionId: `txn_nb_${uuidv4().substring(0, 8)}`,
                gatewayReference: `gw_nb_${Date.now()}`,
                errorCode: 'NETBANKING_FAILED',
                errorMessage: details.failureReason || 'Simulated bank gateway timeout'
            };
        }

        const bankCode = (details?.bankCode || '').toUpperCase();

        if (!bankCode || !this.supportedBanks.includes(bankCode)) {
            return {
                success: false,
                transactionId: `txn_nb_${uuidv4().substring(0, 8)}`,
                gatewayReference: `gw_nb_${Date.now()}`,
                errorCode: 'UNSUPPORTED_BANK',
                errorMessage: `Bank code '${bankCode}' is unsupported. Supported: ${this.supportedBanks.join(', ')}`
            };
        }

        const txnId = `txn_nb_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
        const gwRef = `${bankCode}_REF_${Date.now()}`;

        return {
            success: true,
            transactionId: txnId,
            gatewayReference: gwRef,
            metadata: {
                bankCode,
                processedAmount: amount,
                processedCurrency: currency
            }
        };
    }
}
