const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// تسجيل حساب جديد
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, schoolName, role } = req.body;

    // تحقق من وجود المستخدم
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'المستخدم موجود بالفعل' });
    }

    // إنشاء مستخدم جديد
    user = new User({
      name,
      email,
      password,
      schoolName,
      role: role || 'student',
    });

    await user.save();

    // إنشاء Token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'تم إنشاء الحساب بنجاح',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في التسجيل', error: err.message });
  }
});

// تسجيل الدخول
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'بيانات الدخول غير صحيحة' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'بيانات الدخول غير صحيحة' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
        rank: user.rank,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في تسجيل الدخول', error: err.message });
  }
});

// الحصول على بيانات المستخدم الحالي
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الحصول على البيانات', error: err.message });
  }
});

// الحصول على جميع المستخدمين (محمية)
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password').limit(200);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب المستخدمين', error: err.message });
  }
});

module.exports = router;
