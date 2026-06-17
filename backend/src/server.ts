import dotenv from 'dotenv';
import app from './app';
import connectDB from './config/db';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

import http from 'http';
import { initSocket } from './socket';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
