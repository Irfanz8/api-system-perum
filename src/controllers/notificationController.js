import Notification from '../models/Notification.js';
import { parsePaginationParams, buildPaginationResponse } from '../utils/pagination.js';

/**
 * Get notifications for the current user
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit, offset } = parsePaginationParams(req.query, {
      defaultLimit: 20,
      maxLimit: 50
    });
    const unreadOnly = req.query.unreadOnly === 'true';

    const { data, totalItems, unreadCount } = await Notification.getByUserId(userId, {
      limit,
      offset,
      unreadOnly
    });

    res.json({
      success: true,
      data,
      unreadCount,
      pagination: buildPaginationResponse(totalItems, page, limit)
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.markAsRead(id, userId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notifikasi tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Notifikasi ditandai sudah dibaca',
      data: notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.markAllAsRead(userId);

    res.json({
      success: true,
      message: `${count} notifikasi ditandai sudah dibaca`
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.delete(id, userId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notifikasi tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Notifikasi berhasil dihapus',
      data: notification
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
