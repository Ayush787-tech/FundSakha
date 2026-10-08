import { Router } from 'express';
import authRouter from './auth.router';
import merchantRouter from './merchant.router';
import orderRouter from './order.router';
import paymentRouter from './payment.router';
import refundRouter from './refund.router';
import pingRouter from './ping.router';

const v1Router = Router();

v1Router.use('/ping', pingRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/merchants', merchantRouter);
v1Router.use('/orders', orderRouter);
v1Router.use('/payments', paymentRouter);
v1Router.use('/refunds', refundRouter);

export default v1Router;