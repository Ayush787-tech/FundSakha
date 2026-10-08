import { Merchant } from '../database/models/merchant';

declare global {
    namespace Express {
        interface Request {
            merchant?: Merchant;
            correlationId?: string;
        }
    }
}
