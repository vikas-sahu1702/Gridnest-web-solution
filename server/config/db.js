const mongoose = require('mongoose');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

let retryCount = 0;
let isConnected = false;

const connectDB = async (retries = MAX_RETRIES) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      maxPoolSize: 10,
    });
    isConnected = true;
    retryCount = 0;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    isConnected = false;
    console.error(`MongoDB connection error (attempt ${MAX_RETRIES - retries + 1}/${MAX_RETRIES}): ${error.message}`);

    if (retries > 1) {
      console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB(retries - 1);
    }

    console.error('All MongoDB connection attempts failed.');
    throw error;
  }
};

mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('MongoDB connected');
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('MongoDB disconnected. Attempting to reconnect...');
  setTimeout(() => connectDB(MAX_RETRIES).catch(() => {}), 5000);
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB error: ${err.message}`);
});

const checkDB = (req, res, next) => {
  if (!isConnected || mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database temporarily unavailable. Please try again shortly.',
    });
  }
  next();
};

const getDBConnectionState = () => isConnected;

module.exports = connectDB;
module.exports.checkDB = checkDB;
module.exports.getDBConnectionState = getDBConnectionState;
