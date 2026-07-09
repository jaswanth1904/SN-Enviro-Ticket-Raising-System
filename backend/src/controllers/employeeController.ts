import { Request, Response, NextFunction } from 'express';
import Employee from '../models/Employee';

// @desc    Get all employees
// @route   GET /api/v1/employees
// @access  Private (or Public depending on requirement, assuming Private for now)
export const getEmployees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employees = await Employee.find({}).sort({ employeeId: 1 });
    res.json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee by ID
// @route   GET /api/v1/employees/:id
// @access  Private
export const getEmployeeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try to find by employeeId (e.g. SNE1103) first, then fallback to Mongo _id
    let employee = await Employee.findOne({ employeeId: req.params.id });
    
    if (!employee) {
      employee = await Employee.findById(req.params.id).catch(() => null);
    }

    if (!employee) {
      res.status(404);
      return next(new Error('Employee not found'));
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new employee (For seeder/admin use)
// @route   POST /api/v1/employees
// @access  Private/Admin
export const createEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};
