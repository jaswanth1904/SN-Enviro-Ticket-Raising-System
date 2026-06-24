import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI as string).then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({ email: String }, { strict: false }));
  const result = await User.updateOne({ email: 'admin@snenviro.com' }, { $set: { email: 'support@snenviro.in' } });
  console.log('Update result:', result);
  process.exit(0);
});
