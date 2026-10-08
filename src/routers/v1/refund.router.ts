import { Router } from 'express';
import refundController from '../../controllers/refund.controller';
import { authenticateAny } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { createRefundSchema } from '../../validators/refund.validator';

const refundRouter = Router();

refundRouter.post('/', authenticateAny, validateRequest(createRefundSchema), refundController.processRefund.bind(refundController));
refundRouter.get('/:id', authenticateAny, refundController.getRefundById.bind(refundController));

export default refundRouter;
