import Notification from '../models/Notification.js';
import db from '../config/database.js';

/**
 * Notification Service
 * Utility functions for creating notifications from various system events
 */

/**
 * Create notification for a new sale
 * @param {object} saleData - The sale data
 * @param {string} createdByUserId - User who created the sale
 */
export const createSaleNotification = async (saleData, createdByUserId) => {
  try {
    // Get all admin and superadmin users to notify (except the creator)
    const admins = await db`
      SELECT id FROM users 
      WHERE role IN ('admin', 'superadmin') 
        AND id != ${createdByUserId}
        AND is_active = true
    `;

    if (admins.length === 0) return;

    const userIds = admins.map(a => a.id);
    
    await Notification.createBulk(userIds, {
      type: 'sale_new',
      title: 'Penjualan Baru',
      message: `Penjualan baru untuk pembeli "${saleData.buyer_name}" telah dibuat`,
      data: {
        sale_id: saleData.id,
        buyer_name: saleData.buyer_name,
        sale_price: saleData.sale_price,
        property_id: saleData.property_id
      }
    });
  } catch (error) {
    console.error('Error creating sale notification:', error);
    // Don't throw - notification failure shouldn't break the main flow
  }
};

/**
 * Create notification when a sale is completed
 * @param {object} saleData - The completed sale data
 */
export const createSaleCompleteNotification = async (saleData) => {
  try {
    // Notify all admins about completed sale
    const admins = await db`
      SELECT id FROM users 
      WHERE role IN ('admin', 'superadmin') 
        AND is_active = true
    `;

    if (admins.length === 0) return;

    const userIds = admins.map(a => a.id);
    
    await Notification.createBulk(userIds, {
      type: 'sale_complete',
      title: 'Penjualan Selesai',
      message: `Penjualan kepada "${saleData.buyer_name}" telah selesai`,
      data: {
        sale_id: saleData.id,
        buyer_name: saleData.buyer_name,
        sale_price: saleData.sale_price
      }
    });
  } catch (error) {
    console.error('Error creating sale complete notification:', error);
  }
};

/**
 * Create notification for low stock items
 * @param {object} inventoryData - The inventory item data
 */
export const createLowStockNotification = async (inventoryData) => {
  try {
    // Notify all admins about low stock
    const admins = await db`
      SELECT id FROM users 
      WHERE role IN ('admin', 'superadmin') 
        AND is_active = true
    `;

    if (admins.length === 0) return;

    const userIds = admins.map(a => a.id);
    
    await Notification.createBulk(userIds, {
      type: 'low_stock',
      title: 'Stok Rendah',
      message: `Stok "${inventoryData.name}" tinggal ${inventoryData.quantity} ${inventoryData.unit}`,
      data: {
        inventory_id: inventoryData.id,
        name: inventoryData.name,
        quantity: inventoryData.quantity,
        min_stock: inventoryData.min_stock
      }
    });
  } catch (error) {
    console.error('Error creating low stock notification:', error);
  }
};

/**
 * Create a system notification for all users or specific users
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {array} userIds - Optional: specific user IDs, if empty notify all active users
 */
export const createSystemNotification = async (title, message, userIds = null) => {
  try {
    let targetUserIds = userIds;
    
    if (!targetUserIds || targetUserIds.length === 0) {
      // Get all active users
      const users = await db`
        SELECT id FROM users WHERE is_active = true
      `;
      targetUserIds = users.map(u => u.id);
    }

    if (targetUserIds.length === 0) return;
    
    await Notification.createBulk(targetUserIds, {
      type: 'system',
      title,
      message,
      data: {}
    });
  } catch (error) {
    console.error('Error creating system notification:', error);
  }
};

/**
 * Create notification for a specific user
 * @param {string} userId - Target user ID
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {object} data - Additional data
 */
export const createUserNotification = async (userId, type, title, message, data = {}) => {
  try {
    await Notification.create({
      user_id: userId,
      type,
      title,
      message,
      data
    });
  } catch (error) {
    console.error('Error creating user notification:', error);
  }
};

export default {
  createSaleNotification,
  createSaleCompleteNotification,
  createLowStockNotification,
  createSystemNotification,
  createUserNotification
};
