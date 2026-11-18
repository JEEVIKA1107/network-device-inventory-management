
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://network-device-inventory-management-kujqucgji.vercel.app'
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);


// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  }
});

app.use('/api', apiLimiter);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'NetTrack DFA API is running'
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/devices', require('./routes/deviceRoutes'));
app.use('/api/validation', require('./routes/validationRoutes'));
app.use('/api/monitoring', require('./routes/monitoringRoutes'));
app.use('/api/topology', require('./routes/topologyRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/scopes', require('./routes/scopeRoutes'));

// Feedback Routes
app.use('/api/feedback', require('./routes/feedbackRoutes'));

// Root Route
app.get('/', (req, res) => {
  res.send('NetTrack DFA Backend API is running');
});

// Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(
      `[NetTrack DFA Backend Server running in ${process.env.NODE_ENV || 'development'} on port ${PORT}]`
    );
  });
}

module.exports = app;
