const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'لا يوجد توكن، رجاء سجل دخول' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user info (including role) for permission checks
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'المستخدم غير موجود' });

    req.user = { id: user._id, email: user.email, role: user.role, name: user.name };
    next();
  } catch (err) {
    res.status(401).json({ message: 'توكن غير صحيح' });
  }
};

module.exports = auth;
