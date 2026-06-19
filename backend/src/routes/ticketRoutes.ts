import express from 'express';
import { createTicket, getTickets, updateTicket } from '../controllers/ticketController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router
  .route('/')
  .post(createTicket as any)
  .get(protect as any, getTickets as any);

router
  .route('/:id')
  .patch(protect as any, updateTicket as any);

export default router;
