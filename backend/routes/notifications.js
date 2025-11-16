const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// GET /api/notifications - fetch all notifications for current user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'فشل جلب الإشعارات' });
  }
});

// GET /api/notifications/unread - fetch count of unread notifications
router.get('/unread/count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });

    res.json({ unreadCount: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'فشل جلب عدد الإشعارات' });
  }
});

// PATCH /api/notifications/:id/read - mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'الإشعار غير موجود' });
    }

    if (String(notification.recipient) !== String(req.user.id)) {
      return res.status(403).json({ message: 'لا يمكنك تعديل هذا الإشعار' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: 'تم تعليم الإشعار كمقروء' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'فشل تعديل الإشعار' });
  }
});

// POST /api/notifications/mark-all-read - mark all notifications as read
router.post('/mark-all-read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'تم تعليم جميع الإشعارات كمقروءة' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'فشل تعديل الإشعارات' });
  }
});

// DELETE /api/notifications/:id - delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'الإشعار غير موجود' });
    }

    if (String(notification.recipient) !== String(req.user.id)) {
      return res.status(403).json({ message: 'لا يمكنك حذف هذا الإشعار' });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم حذف الإشعار' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'فشل حذف الإشعار' });
  }
});

module.exports = router;
