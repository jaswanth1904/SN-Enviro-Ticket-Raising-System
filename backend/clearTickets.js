const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
  console.log('MongoDB Connected for cleanup');
  // Clear Tickets only
  await mongoose.connection.collection('tickets').deleteMany({});
  console.log('All tickets have been successfully cleared for a fresh start!');
  process.exit();
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
