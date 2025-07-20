import express from 'express';
import { registerPassenger, login } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerPassenger);
router.post('/login', login);

// Protected admin routes for user management
router.post('/admin/create-driver', protect, authorize('admin'), createBusDriver);
router.post('/admin/create-agent', protect, authorize('admin'), createBusAgent);
router.post('/admin/create-admin', protect, authorize('admin'), createAdmin);

export default router;
