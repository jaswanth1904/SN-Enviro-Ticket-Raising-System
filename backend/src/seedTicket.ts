import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Ticket from './models/Ticket';
import Station from './models/Station';
import User from './models/User';

dotenv.config();

const seedDummyTicket = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to MongoDB');

    // 1. Create a dummy station if none exist
    let station = await Station.findOne();
    if (!station) {
      station = await Station.create({
        stationNumber: 'STN-801',
        industryName: 'Test Industrial Corp',
        district: 'Test District',
        state: 'Test State',
        deviceTypes: ['Test Sensor'],
        coordinates: {
          type: 'Point',
          coordinates: [77.2090, 28.6139]
        }
      });
      console.log('Created dummy station');
    }

    // 2. Find or create an admin user
    let user = await User.findOne({ role: 'admin' });
    if (!user) {
      user = await User.create({
        name: 'Admin Demo',
        email: 'admin@snenviro.com',
        password: 'password123',
        role: 'admin'
      });
      console.log('Created dummy admin user');
    }

    // 3. Create a dummy ticket
    const ticket = await Ticket.create({
      ticketId: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      stationId: station._id,
      creatorId: user._id,
      subject: 'Calibration Error on Sensor Array',
      description: 'The telemetry readings are fluctuating outside the 5% margin of error. Requires immediate field calibration.',
      status: 'Pending'
    });

    console.log('✅ Successfully created dummy ticket:', ticket.ticketId);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding ticket:', error);
    process.exit(1);
  }
};

seedDummyTicket();
