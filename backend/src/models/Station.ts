import mongoose, { Document, Schema } from 'mongoose';

export interface IStation extends Document {
  stationNumber: string;
  industryName: string;
  district?: string;
  state?: string;
  coordinates: {
    type: 'Point';
    coordinates: number[];
  };
  deviceTypes: string[];
}

const stationSchema = new Schema<IStation>(
  {
    stationNumber: {
      type: String,
      required: true,
      index: true,
    },
    industryName: {
      type: String,
      required: true,
    },
    district: {
      type: String,
    },
    state: {
      type: String,
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
        default: [0, 0], // [longitude, latitude]
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

stationSchema.index({ coordinates: '2dsphere' });
stationSchema.index({ stationNumber: 1, industryName: 1 }, { unique: true });

const Station = mongoose.model<IStation>('Station', stationSchema);
export default Station;
