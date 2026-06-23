import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        res.status(401);
        return next(new Error('Not authorized, user not found'));
      }
      
      req.user = user;
      next();
    } catch (error: any) {
      console.error('Auth middleware error:', error.message);
      if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
        res.status(401);
        next(new Error('Not authorized, token failed'));
      } else {
        res.status(500);
        next(new Error('Internal server error during authentication check'));
      }
    }
  }

  if (!token) {
    res.status(401);
    next(new Error('Not authorized, no token'));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error(`User role ${req.user?.role || 'unknown'} is not authorized to access this route`));
    }
    next();
  };
};
