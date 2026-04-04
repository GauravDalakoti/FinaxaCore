import express from 'express';
import { body } from 'express-validator';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// All user routes require authentication + admin role
router.use(protect, authorize('admin'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);

router.post(
  '/',
  [
    body('name').trim().notEmpty().isLength({ min: 2, max: 50 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('role').optional().isIn(['viewer', 'analyst', 'admin']),
    body('status').optional().isIn(['active', 'inactive']),
  ],
  validate,
  createUser
);

router.put(
  '/:id',
  [
    body('name').optional().trim().isLength({ min: 2, max: 50 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('role').optional().isIn(['viewer', 'analyst', 'admin']),
    body('status').optional().isIn(['active', 'inactive']),
  ],
  validate,
  updateUser
);

router.delete('/:id', deleteUser);
router.patch('/:id/toggle-status', toggleUserStatus);

export default router;