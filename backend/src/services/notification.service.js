const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class NotificationService {
  async createNotification(userId, type, title, message, link = null, estateId = null) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          estateId,
          type,
          title,
          message,
          link,
          read: false
        }
      });
      return notification;
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }

  async getUnreadCount(userId) {
    try {
      const count = await prisma.notification.count({
        where: { userId, read: false }
      });
      return count;
    } catch (error) {
      console.error('Get unread count error:', error);
      return 0;
    }
  }

  async getUserNotifications(userId, limit = 20, offset = 0) {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          estate: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });
      return notifications;
    } catch (error) {
      console.error('Get notifications error:', error);
      return [];
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      await prisma.notification.updateMany({
        where: { id: notificationId, userId },
        data: { read: true }
      });
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  }

  async markAllAsRead(userId) {
    try {
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true }
      });
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  }
}

module.exports = new NotificationService();