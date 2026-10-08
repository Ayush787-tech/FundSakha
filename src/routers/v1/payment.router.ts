import { Router } from 'express';
import paymentController from '../../controllers/payment.controller';
import { authenticateAny } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { createPaymentSchema } from '../../validators/payment.validator';

const paymentRouter = Router();

paymentRouter.post('/', authenticateAny, validateRequest(createPaymentSchema), paymentController.processPayment.bind(paymentController));
paymentRouter.get('/:id/status', authenticateAny, paymentController.getPaymentStatus.bind(paymentController));
paymentRouter.get('/:id', authenticateAny, paymentController.getPaymentById.bind(paymentController));

export default paymentRouter;
