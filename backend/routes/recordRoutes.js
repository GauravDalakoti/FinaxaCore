import express from 'express';
import { body } from 'express-validator';
import {
  getAllRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
  restoreRecord,
} from '../controllers/recordController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

// Viewers, Analysts, and Admins can read records
router.get('/', authorize('viewer', 'analyst', 'admin'), getAllRecords);
router.get('/:id', authorize('viewer', 'analyst', 'admin'), getRecordById);

// Only Admins can create/update/delete
router.post(
  '/',
  authorize('admin'),
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('category').isIn([
      'salary', 'freelance', 'investment', 'business', 'rent', 'utilities',
      'food', 'transport', 'healthcare', 'education', 'entertainment', 'shopping', 'other',
    ]).withMessage('Invalid category'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('notes').optional().isLength({ max: 500 }),
  ],
  validate,
  createRecord
);

router.put(
  '/:id',
  authorize('admin'),
  [
    body('title').optional().trim().isLength({ max: 100 }),
    body('amount').optional().isFloat({ min: 0.01 }),
    body('type').optional().isIn(['income', 'expense']),
    body('category').optional().isIn([
      'salary', 'freelance', 'investment', 'business', 'rent', 'utilities',
      'food', 'transport', 'healthcare', 'education', 'entertainment', 'shopping', 'other',
    ]),
    body('date').optional().isISO8601(),
    body('notes').optional().isLength({ max: 500 }),
  ],
  validate,
  updateRecord
);

router.delete('/:id', authorize('admin'), deleteRecord);
router.patch('/:id/restore', authorize('admin'), restoreRecord);

export default router;