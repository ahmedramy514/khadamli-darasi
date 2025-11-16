const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// الحصول على قائمة المستخدمين (محمية)
router.get('/', auth, async (req, res) => {
  try {
    const q = req.query.q ? String(req.query.q).trim() : '';
    const filter = {};
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const users = await User.find(filter).select('-password').limit(50);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب المستخدمين', error: err.message });
  }
});

// IMPORTANT: More specific routes must come BEFORE generic /:userId route

// الحصول على ترتيب النقاط (الأسبوعي والإجمالي)
router.get('/leaderboard', async (req, res) => {
  try {
    // الترتيب الإجمالي
    const allTimeLeaderboard = await User.find()
      .select('name email points rank profileImage totalAnswers helpfulAnswers badges')
      .sort({ points: -1 })
      .limit(50);

    // الترتيب الأسبوعي
    const weeklyLeaderboard = await User.find()
      .select('name email weeklyPoints rank profileImage totalAnswers helpfulAnswers badges')
      .sort({ weeklyPoints: -1 })
      .limit(10);

    res.json({
      allTime: allTimeLeaderboard,
      weekly: weeklyLeaderboard,
    });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب الترتيب', error: err.message });
  }
});

// الحصول على ترتيب الأسبوع (أفضل 10 مساعدين)
router.get('/weekly-top', async (req, res) => {
  try {
    const topHelpers = await User.find()
      .select('name email weeklyPoints rank profileImage badges totalAnswers helpfulAnswers')
      .sort({ weeklyPoints: -1 })
      .limit(10);

    res.json(topHelpers);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب الترتيب الأسبوعي', error: err.message });
  }
});

// الحصول على شارات المستخدم - This route pattern must come BEFORE /:userId
router.get('/:userId/badges', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('badges name');

    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    res.json({
      name: user.name,
      badges: user.badges,
    });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب الشارات', error: err.message });
  }
});

// الحصول على بيانات المستخدم - Generic route comes AFTER specific ones
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    // حساب إحصائيات المستخدم
    const stats = {
      points: user.points,
      weeklyPoints: user.weeklyPoints,
      rank: user.rank,
      totalAnswers: user.totalAnswers,
      helpfulAnswers: user.helpfulAnswers,
      badges: user.badges.length,
      profileImage: user.profileImage,
    };

    res.json({ ...user.toObject(), stats });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب البيانات', error: err.message });
  }
});

// تحديث بيانات المستخدم
router.put('/:userId', auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'لا يمكنك تحديث بيانات غيرك' });
    }

    const { name, bio, schoolName } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { name, bio, schoolName },
      { new: true }
    ).select('-password');

    res.json({
      message: 'تم تحديث البيانات بنجاح',
      user,
    });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في التحديث', error: err.message });
  }
});

module.exports = router;
