const mongoose = require('mongoose');
const dns = require('dns');

if (process.env.NODE_ENV !== 'production' && process.env.DNS_WORKAROUND === 'true') {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined');
    }

    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      autoIndex: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    const message = error?.message || 'Unknown MongoDB connection error';
    console.error(`MongoDB Connection Error: ${message}`);
    throw error;
  }
};

module.exports = connectDB;
