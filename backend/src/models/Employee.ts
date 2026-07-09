import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployee extends Document {
  employeeId: string;
  fullName: string;
  designation: string;
  department: string;
  dateOfJoining: string;
  workContactDetails: string;
  profilePictureUrl?: string;
}

const employeeSchema = new Schema<IEmployee>(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    dateOfJoining: {
      type: String,
      required: true,
    },
    workContactDetails: {
      type: String,
      required: true,
    },
    profilePictureUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Employee = mongoose.model<IEmployee>('Employee', employeeSchema);
export default Employee;
