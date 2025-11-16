# 🎨 دليل إضافة المميزات الجديدة - Features Guide

## 📝 كيفية إضافة ميزة جديدة؟

### الخطوات العامة:

```
1. تصميم البيانات (Schema)
2. إنشاء Model في Mongoose
3. بناء Route و Controller
4. بناء Frontend Component
5. الاختبار
```

---

## 💬 مثال: إضافة نظام الرسائل الخاصة

### الخطوة 1: إنشاء Model

**File:** `backend/models/Message.js`

```javascript
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Message', MessageSchema);
```

### الخطوة 2: إنشاء Routes

**File:** `backend/routes/messages.js`

```javascript
const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

// إرسال رسالة
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    const message = new Message({
      sender: req.user.id,
      receiver: receiverId,
      content,
    });

    await message.save();
    await message.populate('sender', 'name email');

    res.status(201).json({
      message: 'تم إرسال الرسالة',
      data: message,
    });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الإرسال', error: err.message });
  }
});

// جلب الرسائل
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id },
      ],
    })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب الرسائل' });
  }
});

module.exports = router;
```

### الخطوة 3: إضافة Route في server.js

```javascript
// في backend/server.js
app.use('/api/messages', require('./routes/messages'));
```

### الخطوة 4: إنشاء Frontend Component

**File:** `frontend/src/pages/Messages.jsx`

```javascript
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const { token, user } = useContext(AuthContext);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const response = await axios.post(
        `${API_URL}/messages`,
        {
          receiverId: selectedUser._id,
          content: newMessage,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages([...messages, response.data.data]);
      setNewMessage('');
    } catch (err) {
      console.error('خطأ:', err);
    }
  };

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-4">💬 الرسائل</h1>
      {/* UI الرسائل */}
    </div>
  );
};

export default Messages;
```

---

## 📸 مثال: إضافة نظام رفع الصور

### الخطوة 1: تثبيت multer

```bash
npm install multer
```

### الخطوة 2: إعداد رفع الملفات

**File:** `backend/middleware/upload.js`

```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);

    if (mime && ext) return cb(null, true);
    cb(new Error('صيغة الملف غير مسموحة'));
  },
});

module.exports = upload;
```

### الخطوة 3: Route لرفع الصور

```javascript
const upload = require('../middleware/upload');

router.post('/upload', auth, upload.single('image'), (req, res) => {
  res.json({
    message: 'تم رفع الصورة',
    path: req.file.path,
  });
});
```

---

## 🔔 مثال: إضافة نظام الإشعارات

### الخطوة 1: Model الإشعارات

```javascript
// backend/models/Notification.js
const NotificationSchema = new mongoose.Schema({
  user: mongoose.Schema.Types.ObjectId,
  type: String, // 'new_question', 'new_answer', 'new_message'
  content: String,
  relatedId: mongoose.Schema.Types.ObjectId,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
```

### الخطوة 2: إنشاء إشعار

```javascript
const createNotification = async (userId, type, content, relatedId) => {
  const notification = new Notification({
    user: userId,
    type,
    content,
    relatedId,
  });
  await notification.save();
};

// في route الأسئلة
await createNotification(
  classroom.teacher,
  'new_question',
  `سؤال جديد من ${req.user.name}`,
  question._id
);
```

---

## 🎨 مثال: إضافة الوضع الليلي

### في Frontend:

```javascript
// frontend/src/context/ThemeContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### في tailwind.config.js:

```javascript
module.exports = {
  darkMode: 'class',
  // ... باقي الإعدادات
};
```

---

## 🏆 مثال: إضافة نظام الشارات

### Model الشارات:

```javascript
const BadgeSchema = new mongoose.Schema({
  name: String,
  icon: String,
  requirement: Number, // عدد النقاط المطلوبة
  description: String,
});

const UserBadgeSchema = new mongoose.Schema({
  user: mongoose.Schema.Types.ObjectId,
  badge: mongoose.Schema.Types.ObjectId,
  unlockedAt: { type: Date, default: Date.now },
});
```

### دالة فحص الشارات:

```javascript
const checkAndUnlockBadges = async (userId) => {
  const user = await User.findById(userId);
  const badges = await Badge.find();

  for (const badge of badges) {
    const existing = await UserBadge.findOne({ user: userId, badge: badge._id });
    if (!existing && user.points >= badge.requirement) {
      await UserBadge.create({ user: userId, badge: badge._id });
    }
  }
};
```

---

## 🔍 مثال: إضافة البحث المتقدم

### Backend Route:

```javascript
router.get('/search', auth, async (req, res) => {
  const { q, type } = req.query; // type: 'questions' | 'users' | 'classrooms'

  try {
    if (type === 'questions') {
      const results = await Question.find({
        $text: { $search: q },
      }).populate('askedBy');
      res.json(results);
    } else if (type === 'users') {
      const results = await User.find({
        $or: [
          { name: new RegExp(q, 'i') },
          { email: new RegExp(q, 'i') },
        ],
      }).select('-password');
      res.json(results);
    }
  } catch (err) {
    res.status(500).json({ message: 'خطأ في البحث' });
  }
});
```

### في MongoDB، أضف text index:

```javascript
// في Model
QuestionSchema.index({ title: 'text', description: 'text' });
```

---

## 📊 مثال: إضافة لوحة تحكم المدرس

```javascript
// frontend/src/pages/TeacherDashboard.jsx
const TeacherDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalQuestions: 0,
    averageGrade: 0,
  });

  useEffect(() => {
    // جلب إحصائيات الفصل
    fetchStats();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">لوحة التحكم</h1>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-500 text-white p-6 rounded-lg">
          <p className="text-sm">عدد الطلاب</p>
          <p className="text-3xl font-bold">{stats.totalStudents}</p>
        </div>
        {/* بطاقات إحصائية أخرى */}
      </div>
    </div>
  );
};
```

---

## ✅ Checklist لإضافة ميزة جديدة

- [ ] تصميم Schema البيانات
- [ ] إنشاء Model في Mongoose
- [ ] بناء API Routes
- [ ] اختبار API مع Postman
- [ ] بناء Frontend Components
- [ ] إضافة State Management
- [ ] التعامل مع الأخطاء
- [ ] الاختبار الشامل
- [ ] التوثيق
- [ ] Commit و Push

---

## 🚀 موارد إضافية

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Mongoose Documentation](https://mongoosejs.com/)
- [React Hooks](https://react.dev/reference/react)
- [API Design Guide](https://restfulapi.net/)

---

**جاهز لإضافة مميزات جديدة؟ ابدأ الآن! 🎉**
