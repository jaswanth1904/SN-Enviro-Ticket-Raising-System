import express from 'express';
import { registerUser, loginUser, getMe, updateProfile } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.route('/profile').patch(protect, updateProfile).put(protect, updateProfile).post(protect, updateProfile);

export default router;
