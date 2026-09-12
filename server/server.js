require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { protect } = require('./middleware/auth');
const ServiceProvider = require('./models/ServiceProvider');

const authRoutes = require('./routes/auth');
const providerRoutes = require('./routes/providers');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
const disputeRoutes = require('./routes/disputes');
const categoryRoutes = require('./routes/categories');
const adminRoutes = require('./routes/admin');

const app = express();

const uploadsDir = path.join(__dirname, 'uploads/documents');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/api/documents/:filename', protect, async (req, res, next) => {
  try {
    const filename = path.basename(req.params.filename);
    const owner = await ServiceProvider.findOne({ 'documents.filename': filename }).select('userId');
    const isOwner = owner?.userId?.toString() === req.user._id.toString();

    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to access documents' });
    }

    const filePath = path.join(__dirname, 'uploads/documents', filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
});

app.get('/api/health', async (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  const apiReady = true;

  res.status(apiReady && dbReady ? 200 : 503).json({
    success: apiReady && dbReady,
    message: dbReady ? 'API is healthy and database is ready' : 'API is running but database is not ready',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    api: {
      status: 'up',
      ready: apiReady,
    },
    database: {
      ready: dbReady,
      state: mongoose.connection.readyState,
      host: mongoose.connection.host || null,
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`\n🚀 Mall & Home Utility Services Aggregator API`);
      console.log(`   Server: http://localhost:${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/api/health`);
      console.log(`   Env:    ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('Failed to start server because MongoDB connection did not succeed.');
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
