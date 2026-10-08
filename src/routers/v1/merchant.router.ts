import { Router } from 'express';
import merchantController from '../../controllers/merchant.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { createApiKeySchema } from '../../validators/merchant.validator';

const merchantRouter = Router();

merchantRouter.post('/api-keys', authenticateJWT, validateRequest(createApiKeySchema), merchantController.createApiKey.bind(merchantController));
merchantRouter.get('/me', authenticateJWT, merchantController.getProfile.bind(merchantController));
merchantRouter.get('/ledger', authenticateJWT, merchantController.getLedger.bind(merchantController));

export default merchantRouter;
