import { Request, Response, NextFunction } from 'express';
import Station from '../models/Station';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Create a new station
// @route   POST /api/v1/stations
// @access  Private/Admin
export const createStation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { stationNumber, industryName, location, deviceTypes } = req.body;

    const stationExists = await Station.findOne({ stationNumber });

    if (stationExists) {
      res.status(400);
      return next(new Error('Station already exists with this station number'));
    }

    const station = await Station.create({
      stationNumber,
      industryName,
      district: location,
      deviceTypes,
    });

    res.status(201).json({
      success: true,
      data: station,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active monitoring stations
// @route   GET /api/v1/stations
// @access  Private
export const getStations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stations = await Station.find({});
    res.json({
      success: true,
      count: stations.length,
      data: stations,
    });
  } catch (error) {
    next(error);
  }
};
