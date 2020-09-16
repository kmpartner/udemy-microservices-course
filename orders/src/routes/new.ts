const mongoose = require('mongoose');
const express = require('express');
import { Request, Response } from 'express';
import { 
  requireAuth, 
  validateRequest, 
  NotFoundError, 
  OrderStatus, 
  BadRequestError 
} from '@sgtickets/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECOND = 1 * 60;

router.post('/api/orders', requireAuth, [
  body('ticketId')
    .not()
    .isEmpty()
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('TicketId must be provided')
  ], 
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    // find the ticket the user is trying to orer in the database
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    // make sure that this ticket is already reserved
    // run query to look at all orders. find an order where the ticket is the ticket we just fond *and* the orders status is *not* cancelled. if we find an order from that means the ticket *is* reserved
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved');
    }

    // caluculate an expiration date
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECOND);

    // build the order ande save it to the database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket
    });
    await order.save();

    // publish an event saying that an order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      }
    });

    res.status(201).send(order);
});

export { router as newOrderRouter };