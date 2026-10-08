import { PaymentMethod } from '../../database/models/payment';

export interface PaymentProcessInput {
    amount: number;
    currency: string;
    orderId: string;
    merchantId: string;
    paymentMethod: PaymentMethod;
    details?: {
        // Credit Card
        cardNumber?: string;
        expiryMonth?: string;
        expiryYear?: string;
        cvv?: string;
        cardHolderName?: string;
        // UPI
        upiId?: string;
        // NetBanking
        bankCode?: string;
        // Mock Wallet
        walletId?: string;
        // Simulation triggers for testing
        simulateFailure?: boolean;
        failureReason?: string;
    };
}

export interface PaymentProcessResult {
    success: boolean;
    transactionId: string;
    gatewayReference: string;
    errorCode?: string;
    errorMessage?: string;
    metadata?: Record<string, any>;
}

export interface PaymentStrategy {
    process(input: PaymentProcessInput): Promise<PaymentProcessResult>;
}
