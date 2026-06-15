import mongoose, { Document, Schema } from 'mongoose';

export interface ITicket extends Document {
  ticketId: string;
  stationId: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  subject: string;
  description: string;
  status: 'Pending' | 'In-Progress' | 'Resolved';
  s3ImageUrl?: string;
  notes?: string;
}

const ticketSchema = new Schema<ITicket>(
  {
    ticketId: {
      type: String,
      unique: true,
      index: true,
    },
    stationId: {
      type: Schema.Types.ObjectId,
      ref: 'Station',
      required: true,
      index: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    subject: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'In-Progress', 'Resolved'],
      default: 'Pending',
    },
    s3ImageUrl: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

ticketSchema.pre('save', async function () {
  if (!this.isNew) {
    return;
  }

  const currentYear = new Date().getFullYear();
  const prefix = `SN-${currentYear}-`;

  // Find the highest ticket ID for the current year
  const lastTicket = await mongoose.model<ITicket>('Ticket').findOne(
    { ticketId: new RegExp(`^${prefix}`) },
    { ticketId: 1 },
    { sort: { ticketId: -1 } }
  );

  let nextNumber = 1001;
  if (lastTicket && lastTicket.ticketId) {
    const lastNumberMatch = lastTicket.ticketId.match(/-(\d+)$/);
    if (lastNumberMatch && lastNumberMatch[1]) {
      nextNumber = parseInt(lastNumberMatch[1], 10) + 1;
    }
  }

  this.ticketId = `${prefix}${nextNumber}`;
});

const Ticket = mongoose.model<ITicket>('Ticket', ticketSchema);
export default Ticket;
