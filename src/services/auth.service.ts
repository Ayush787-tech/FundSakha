import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config';
import merchantRepository from '../repositories/merchant.repository';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { ConflictError, UnauthorizedError } from '../shared/errors/appError';
import { paiseToRupees } from '../shared/utils/money';

export class AuthService {
    async registerMerchant(input: RegisterInput) {
        const existingMerchant = await merchantRepository.findByEmail(input.email);
        if (existingMerchant) {
            throw new ConflictError('A merchant with this email address already exists');
        }

        const password_hash = await bcrypt.hash(input.password, 10);
        const merchant = await merchantRepository.create({
            name: input.name,
            email: input.email,
            password_hash,
            balance: 0
        });

        const token = this.generateToken(merchant.id, merchant.email);

        return {
            merchant: {
                id: merchant.id,
                name: merchant.name,
                email: merchant.email,
                balance_paise: Number(merchant.balance),
                balance_rupees: paiseToRupees(Number(merchant.balance)),
                status: merchant.status,
                createdAt: merchant.createdAt
            },
            token
        };
    }

    async loginMerchant(input: LoginInput) {
        const merchant = await merchantRepository.findByEmail(input.email);
        if (!merchant) {
            throw new UnauthorizedError('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(input.password, merchant.password_hash);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid email or password');
        }

        const token = this.generateToken(merchant.id, merchant.email);

        return {
            merchant: {
                id: merchant.id,
                name: merchant.name,
                email: merchant.email,
                balance_paise: Number(merchant.balance),
                balance_rupees: paiseToRupees(Number(merchant.balance)),
                status: merchant.status,
                createdAt: merchant.createdAt
            },
            token
        };
    }

    private generateToken(merchantId: string, email: string): string {
        return jwt.sign({ merchantId, email }, jwtConfig.JWT_SECRET, {
            expiresIn: jwtConfig.JWT_EXPIRES_IN as any
        });
    }
}

export default new AuthService();
