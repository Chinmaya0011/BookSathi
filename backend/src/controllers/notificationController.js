import { Notification } from '../models/Notification.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const proId = req.profile?._id;

    const query = {
      $or: [
        { userId },
        ...(proId ? [{ professionalId: proId }] : []),
        ...(req.user.role === 'ADMIN' ? [{ recipientRole: 'ADMIN' }] : []),
      ],
    };

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).limit(50).lean(),
      Notification.countDocuments({ ...query, isRead: false }),
    ]);

    return successResponse(res, 200, 'Notifications retrieved', {
      notifications,
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return errorResponse(res, 404, 'Notification not found');
    }

    return successResponse(res, 200, 'Notification marked as read', notification);
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const proId = req.profile?._id;

    const query = {
      isRead: false,
      $or: [
        { userId },
        ...(proId ? [{ professionalId: proId }] : []),
        ...(req.user.role === 'ADMIN' ? [{ recipientRole: 'ADMIN' }] : []),
      ],
    };

    await Notification.updateMany(query, { isRead: true });

    return successResponse(res, 200, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
};
