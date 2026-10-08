import { Router } from 'express';
import orderController from '../../controllers/order.controller';
import { authenticateAny } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { createOrderSchema } from '../../validators/order.validator';

const orderRouter = Router();

orderRouter.post('/', authenticateAny, validateRequest(createOrderSchema), orderController.createOrder.bind(orderController));
orderRouter.get('/', authenticateAny, orderController.listOrders.bind(orderController));
orderRouter.get('/:id', authenticateAny, orderController.getOrderById.bind(orderController));

export default orderRouter;
