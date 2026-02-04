import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.js';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notificationController.js';

const router = Router();

/**
 * @route GET /api/notifications
 * @desc Get notifications for current user
 * @query page - Page number (default: 1)
 * @query limit - Items per page (default: 20, max: 50)
 * @query unreadOnly - Show only unread (default: false)
 */
router.get('/', authenticateUser, getNotifications);

/**
 * @route GET /api/notifications/unread-count
 * @desc Get unread notification count
 */
router.get('/unread-count', authenticateUser, getUnreadCount);

/**
 * @route PATCH /api/notifications/read-all
 * @desc Mark all notifications as read
 */
router.patch('/read-all', authenticateUser, markAllAsRead);

/**
 * @route PATCH /api/notifications/:id/read
 * @desc Mark a single notification as read
 */
router.patch('/:id/read', authenticateUser, markAsRead);

/**
 * @route DELETE /api/notifications/:id
 * @desc Delete a notification
 */
router.delete('/:id', authenticateUser, deleteNotification);

export default router;
