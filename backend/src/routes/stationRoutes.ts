import express from 'express';
import { createStation, getStations } from '../controllers/stationController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router
  .route('/')
  .get(protect as any, getStations as any)
  .post(protect as any, authorize('admin'), createStation as any);

export default router;
