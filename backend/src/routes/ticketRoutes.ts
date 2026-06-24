import express from 'express';
import { createTicket, getTickets, updateTicket } from '../controllers/ticketController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();
import nodemailer from 'nodemailer';

router.get('/test-email', async (req, res) => {
  try {
    const port = parseInt(process.env.SMTP_PORT || '465');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.verify();
    const info = await transporter.sendMail({
      from: `"SN Enviro Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // sends to itself
      subject: 'Render Production SMTP Test',
      html: '<h1>SMTP test successful!</h1>'
    });
    res.json({ success: true, message: 'SMTP credentials are valid and email was sent!', info });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: 'SMTP Error', 
      error: error.message,
      code: error.code,
      response: error.response
    });
  }
});

router
  .route('/')
  .post(createTicket as any)
  .get(protect as any, getTickets as any);

router
  .route('/:id')
  .patch(protect as any, updateTicket as any);

export default router;
