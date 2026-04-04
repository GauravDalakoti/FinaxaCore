import express from 'express';
import {
  getSummary,
  getCategoryTotals,
  getMonthlyTrends,
  getRecentActivity,
  getWeeklyTrends,
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);


router.get('/summary', authorize('viewer', 'analyst', 'admin'), getSummary);
router.get('/recent', authorize('viewer', 'analyst', 'admin'), getRecentActivity);

router.get('/by-category', authorize('analyst', 'admin'), getCategoryTotals);
router.get('/monthly-trends', authorize('analyst', 'admin'), getMonthlyTrends);
router.get('/weekly-trends', authorize('analyst', 'admin'), getWeeklyTrends);

export default router;