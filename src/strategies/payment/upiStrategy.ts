import { PaymentStrategy, PaymentProcessInput, PaymentProcessResult } from './paymentStrategy.interface';
import { v4 as uuidv4 } from 'uuid';

export class UpiStrategy implements PaymentStrategy {
    async process(input: PaymentProcessInput): Promise<PaymentProcessResult> {
        const { details, amount, currency } = input;

        if (details?.simulateFailure) {
            return {
                success: false,
                transactionId: `txn_upi_${uuidv4().substring(0, 8)}`,
                gatewayReference: `gw_upi_${Date.now()}`,
                errorCode: 'UPI_PAYMENT_FAILED',
                errorMessage: details.failureReason || 'Simulated UPI debit failure'
            };
        }

        const upiId = details?.upiId || '';
        const upiRegex = /^[\w.-]+@[\w.-]+$/;

        if (!upiId || !upiRegex.test(upiId)) {
            return {
                success: false,
                transactionId: `txn_upi_${uuidv4().substring(0, 8)}`,
                gatewayReference: `gw_upi_${Date.now()}`,
                errorCode: 'INVALID_UPI_ID',
                errorMessage: 'Invalid UPI VPA format. Expected user@bank'
            };
        }

        if (upiId.toLowerCase().includes('fail')) {
            return {
                success: false,
                transactionId: `txn_upi_${uuidv4().substring(0, 8)}`,
                gatewayReference: `gw_upi_${Date.now()}`,
                errorCode: 'UPI_PIN_INCORRECT',
                errorMessage: 'UPI PIN entered was incorrect'
            };
        }

        const txnId = `txn_upi_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
        const gwRef = `npci_rrn_${Math.floor(100000000000 + Math.random() * 900000000000)}`;

        return {
            success: true,
            transactionId: txnId,
            gatewayReference: gwRef,
            metadata: {
                upiId,
                npciRefNo: gwRef,
                processedAmount: amount,
                processedCurrency: currency
            }
        };
    }
}
