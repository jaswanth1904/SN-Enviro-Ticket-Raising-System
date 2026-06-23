import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string, {
      maxPoolSize: 50,
      socketTimeoutMS: 45000,
      family: 4,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Enterprise Replica Set failover and connection drop interception
    mongoose.connection.on('error', (err) => {
      console.error('❌ CRITICAL DB ALERT: MongoDB Connection Error Encountered', err);
      // In production, this would trigger an SNS topic, PagerDuty, or direct admin email.
    });

    mongoose.connection.on('disconnected', () => {
      console.error('⚠️ CRITICAL DB ALERT: MongoDB Connection Dropped! Waiting for auto-reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ DB RECOVERY: MongoDB Reconnected Successfully.');
    });

  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
