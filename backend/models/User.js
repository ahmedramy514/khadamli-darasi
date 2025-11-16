const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  schoolName: {
    type: String,
    default: '',
  },
  profileImage: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'helper'],
    default: 'student',
  },
  points: {
    type: Number,
    default: 0,
  },
  weeklyPoints: {
    type: Number,
    default: 0,
  },
  totalAnswers: {
    type: Number,
    default: 0,
  },
  helpfulAnswers: {
    type: Number,
    default: 0,
  },
  rank: {
    type: String,
    enum: ['مساعد مبتدئ', 'مساعد فضي', 'مساعد ذهبي', 'مساعد خبير'],
    default: 'مساعد مبتدئ',
  },
  badges: [
    {
      name: String,
      description: String,
      icon: String,
      earnedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  bio: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastWeeklyReset: {
    type: Date,
    default: Date.now,
  },
});

// Hash password قبل الحفظ
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method للمقارنة بين كلمات المرور
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method لحساب الترتيب بناءً على النقاط
UserSchema.methods.updateRank = function() {
  if (this.points >= 300) {
    this.rank = 'مساعد خبير';
  } else if (this.points >= 150) {
    this.rank = 'مساعد ذهبي';
  } else if (this.points >= 50) {
    this.rank = 'مساعد فضي';
  } else {
    this.rank = 'مساعد مبتدئ';
  }
};

// Method لإضافة شارة
UserSchema.methods.addBadge = function(name, description, icon) {
  // تجنب التكرار
  const exists = this.badges.some(b => b.name === name);
  if (!exists) {
    this.badges.push({ name, description, icon, earnedAt: new Date() });
  }
};

module.exports = mongoose.model('User', UserSchema);
