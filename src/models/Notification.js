import db from '../config/database.js';

class Notification {
  /**
   * Create a new notification
   * @param {object} data - Notification data
   * @returns {object} Created notification
   */
  static async create(data) {
    const { user_id, type, title, message, data: notificationData } = data;
    
    const result = await db`
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (${user_id}, ${type}, ${title}, ${message || null}, ${JSON.stringify(notificationData || {})})
      RETURNING *
    `;
    return result[0];
  }

  /**
   * Create notifications for multiple users
   * @param {array} userIds - Array of user IDs
   * @param {object} data - Notification data (type, title, message, data)
   * @returns {array} Created notifications
   */
  static async createBulk(userIds, data) {
    const { type, title, message, data: notificationData } = data;
    
    const notifications = userIds.map(userId => ({
      user_id: userId,
      type,
      title,
      message: message || null,
      data: JSON.stringify(notificationData || {})
    }));

    // Bulk insert
    const result = await db`
      INSERT INTO notifications ${db(notifications, 'user_id', 'type', 'title', 'message', 'data')}
      RETURNING *
    `;
    return result;
  }

  /**
   * Get notifications for a user with pagination
   * @param {string} userId - User ID
   * @param {object} options - Query options (limit, offset, unreadOnly)
   * @returns {object} { data, totalItems, unreadCount }
   */
  static async getByUserId(userId, options = {}) {
    const { limit = 20, offset = 0, unreadOnly = false } = options;
    
    // Build WHERE clause
    const conditions = [db`user_id = ${userId}`];
    if (unreadOnly) {
      conditions.push(db`is_read = false`);
    }
    const whereClause = db`WHERE ${conditions.reduce((a, b) => db`${a} AND ${b}`)}`;

    // Get total count
    const countResult = await db`
      SELECT COUNT(*) as total FROM notifications ${whereClause}
    `;
    const totalItems = parseInt(countResult[0].total);

    // Get unread count (always)
    const unreadResult = await db`
      SELECT COUNT(*) as count FROM notifications 
      WHERE user_id = ${userId} AND is_read = false
    `;
    const unreadCount = parseInt(unreadResult[0].count);

    // Get paginated data
    const data = await db`
      SELECT * FROM notifications
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return { data, totalItems, unreadCount };
  }

  /**
   * Get a single notification by ID
   * @param {string} id - Notification ID
   * @returns {object} Notification
   */
  static async getById(id) {
    const result = await db`SELECT * FROM notifications WHERE id = ${id}`;
    return result[0];
  }

  /**
   * Mark a notification as read
   * @param {string} id - Notification ID
   * @param {string} userId - User ID (for security check)
   * @returns {object} Updated notification
   */
  static async markAsRead(id, userId) {
    const result = await db`
      UPDATE notifications 
      SET is_read = true 
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;
    return result[0];
  }

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @returns {number} Number of notifications updated
   */
  static async markAllAsRead(userId) {
    const result = await db`
      UPDATE notifications 
      SET is_read = true 
      WHERE user_id = ${userId} AND is_read = false
    `;
    return result.count;
  }

  /**
   * Delete a notification
   * @param {string} id - Notification ID
   * @param {string} userId - User ID (for security check)
   * @returns {object} Deleted notification
   */
  static async delete(id, userId) {
    const result = await db`
      DELETE FROM notifications 
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;
    return result[0];
  }

  /**
   * Delete old notifications (for cleanup)
   * @param {number} daysOld - Delete notifications older than this many days
   * @returns {number} Number of notifications deleted
   */
  static async deleteOld(daysOld = 90) {
    const result = await db`
      DELETE FROM notifications 
      WHERE created_at < NOW() - INTERVAL '${daysOld} days'
    `;
    return result.count;
  }

  /**
   * Get unread count for a user
   * @param {string} userId - User ID
   * @returns {number} Unread count
   */
  static async getUnreadCount(userId) {
    const result = await db`
      SELECT COUNT(*) as count FROM notifications 
      WHERE user_id = ${userId} AND is_read = false
    `;
    return parseInt(result[0].count);
  }
}

export default Notification;
