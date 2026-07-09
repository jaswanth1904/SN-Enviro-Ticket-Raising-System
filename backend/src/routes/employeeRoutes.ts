import express from 'express';
import { getEmployees, getEmployeeById, createEmployee } from '../controllers/employeeController';

const router = express.Router();

router.route('/')
  .get(getEmployees)
  .post(createEmployee);

router.route('/:id')
  .get(getEmployeeById);

export default router;
