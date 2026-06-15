import mongoose, { Document, Schema } from 'mongoose';

export interface IStation extends Document {
  stationNumber: string;
  industryName: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  deviceTypes: string[];
}

const stationSchema = new Schema<IStation>(
  {
    stationNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    industryName: {
      type: String,
      required: true,
    },
    location: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
      },
    },
    deviceTypes: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Station = mongoose.model<IStation>('Station', stationSchema);
export default Station;
