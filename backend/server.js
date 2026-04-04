import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import errorHandler from './src/middleware/errorHandler.js';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import recordRoutes from './src/routes/recordRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';

dotenv.config();
connectDB();

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use('/api', limiter);


app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Finance Dashboard API is running', timestamp: new Date() });
});


app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

app.use(errorHandler);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(` Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
// });

export default app;