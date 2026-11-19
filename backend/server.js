
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// ===============================
// CORS CONFIGURATION
// ===============================

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',

  // Production Vercel URLs
  'https://network-device-inventory-management.vercel.app',
  'https://network-device-inventory-management-kujqucgji.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests without an Origin header
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ===============================
// GENERAL MIDDLEWARE
// ===============================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ===============================
// DATABASE CONNECTION
// ===============================

connectDB();

// ===============================
// API RATE LIMITER
// ===============================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  }
});

app.use('/api', apiLimiter);

// ===============================
// HEALTH CHECK
// ===============================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'NetTrack DFA API is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// ===============================
// API ROUTES
// ===============================

app.use('/api/auth', require('./routes/authRoutes'));

app.use('/api/devices', require('./routes/deviceRoutes'));

app.use('/api/validation', require('./routes/validationRoutes'));

app.use('/api/monitoring', require('./routes/monitoringRoutes'));

app.use('/api/topology', require('./routes/topologyRoutes'));

app.use('/api/reports', require('./routes/reportRoutes'));

app.use('/api/users', require('./routes/userRoutes'));

app.use('/api/scopes', require('./routes/scopeRoutes'));

app.use('/api/feedback', require('./routes/feedbackRoutes'));

// ===============================
// ROOT ROUTE
// ===============================

app.get('/', (req, res) => {
  res.status(200).send('NetTrack DFA Backend API is running');
});

// ===============================
// ERROR HANDLER
// ===============================

app.use(errorHandler);

// ===============================
// START SERVER
// ===============================

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(
      `NetTrack DFA Backend running in ${
        process.env.NODE_ENV || 'development'
      } mode on port ${PORT}`
    );
  });
}

module.exports = app;
