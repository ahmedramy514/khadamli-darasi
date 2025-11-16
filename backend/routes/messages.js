const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// GET /api/messages - fetch all messages for current user (inbox + sent)
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { recipient: req.user.id },
        { sender: req.user.id },
      ],
    })
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar')
      .populate('classroom', 'name')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'فشل جلب الرسائل' });
  }
});

// GET /api/messages/conversation/:userId - fetch conversation with specific user
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user.id },
      ],
    })
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'فشل جلب المحادثة' });
  }
});

// POST /api/messages - send a new message (with optional attachment)
router.post('/', auth, upload.single('attachment'), async (req, res) => {
  try {
    const { recipientId, classroomId, content } = req.body;

    if (!recipientId || !content) {
      return res.status(400).json({ message: 'المستقبل والمحتوى مطلوبان' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    const message = new Message({
      sender: req.user.id,
      recipient: recipientId,
      classroom: classroomId || null,
      content,
      attachment: req.file ? `/uploads/${req.file.filename}` : null,
    });

    await message.save();
    await message.populate('sender', 'name email avatar');
    await message.populate('recipient', 'name email avatar');

    // Create notification for recipient
    const notification = new Notification({
      recipient: recipientId,
      type: 'message',
      title: 'رسالة جديدة',
      description: `رسالة من ${req.user.name}`,
      relatedId: message._id,
    });
    await notification.save();

    // Emit real-time events if socket.io is available
    try {
      const io = req.app.get('io');
      if (io) {
        // send to recipient room
        io.to(String(recipientId)).emit('new_message', message);
        // also send notification event
        io.to(String(recipientId)).emit('notification', notification);
      }
    } catch (e) {
      console.warn('Failed to emit socket event:', e.message);
    }

    res.status(201).json({ message: 'تم إرسال الرسالة', data: message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'فشل إرسال الرسالة' });
  }
});

// PATCH /api/messages/:id/read - mark message as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'الرسالة غير موجودة' });
    }

    if (String(message.recipient) !== String(req.user.id)) {
      return res.status(403).json({ message: 'لا يمكنك تعديل هذه الرسالة' });
    }

    message.isRead = true;
    await message.save();

    res.json({ message: 'تم تعليم الرسالة كمقروءة' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'فشل تعديل الرسالة' });
  }
});

// DELETE /api/messages/:id - delete message
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'الرسالة غير موجودة' });
    }

    if (String(message.sender) !== String(req.user.id) && String(message.recipient) !== String(req.user.id)) {
      return res.status(403).json({ message: 'لا يمكنك حذف هذه الرسالة' });
    }

    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم حذف الرسالة' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'فشل حذف الرسالة' });
  }
});

module.exports = router;
