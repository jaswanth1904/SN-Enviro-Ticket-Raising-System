import express from 'express';
import { registerUser, loginUser } from '../controllers/authController';

const router = express.Router();

router.post('/register', registerUser as any);
router.post('/login', loginUser as any);

export default router;
