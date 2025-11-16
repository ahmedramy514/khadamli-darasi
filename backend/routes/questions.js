const express = require('express');
const Question = require('../models/Question');
const User = require('../models/User');
const Classroom = require('../models/Classroom');
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

const router = express.Router();

// رفع سؤال جديد
// Create a question (optional file upload). classroomId is optional for public questions.
router.post('/', auth, upload.single('attachment'), async (req, res) => {
  try {
    const { title, description, classroomId, subject, deadline } = req.body;

    let classroom = null;
    if (classroomId) {
      classroom = await Classroom.findById(classroomId);
      if (!classroom) {
        return res.status(404).json({ message: 'الفصل غير موجود' });
      }
    }

    const question = new Question({
      title,
      description,
      classroom: classroom ? classroom._id : null,
      askedBy: req.user.id,
      subject: subject || (classroom ? classroom.subject : ''),
      deadline: deadline || null,
    });

    if (req.file) {
      question.attachments.push({
        url: `/uploads/${req.file.filename}`,
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
      });
    }

    await question.save();
    await question.populate('askedBy', 'name email');

    res.status(201).json({
      message: 'تم رفع السؤال بنجاح',
      question,
    });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في رفع السؤال', error: err.message });
  }
});

// الحصول على أسئلة الفصل
router.get('/classroom/:classroomId', auth, async (req, res) => {
  try {
    const questions = await Question.find({ classroom: req.params.classroomId })
      .populate('askedBy', 'name email points rank')
      .populate('answers.answeredBy', 'name email points rank')
      .sort({ createdAt: -1 });

    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب الأسئلة', error: err.message });
  }
});

// Get public questions (not assigned to any classroom)
router.get('/public', auth, async (req, res) => {
  try {
    const questions = await Question.find({ classroom: null })
      .populate('askedBy', 'name email points rank')
      .populate('answers.answeredBy', 'name email points rank')
      .sort({ createdAt: -1 });

    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب الأسئلة العامة', error: err.message });
  }
});

// إضافة إجابة على سؤال
// Add answer to a question (supports optional file upload)
router.post('/:questionId/answer', auth, upload.single('attachment'), async (req, res) => {
  try {
    const { text } = req.body;

    const question = await Question.findById(req.params.questionId);
    if (!question) {
      return res.status(404).json({ message: 'السؤال غير موجود' });
    }

    const answer = {
      text,
      answeredBy: req.user.id,
    };

    if (req.file) {
      answer.image = `/uploads/${req.file.filename}`;
    }

    question.answers.push(answer);

    // إضافة نقاط للمجيب
    const user = await User.findById(req.user.id);
    user.points += 10;
    user.weeklyPoints += 10;
    user.totalAnswers += 1;
    
    // تحديث الـ Rank
    user.updateRank();

    // فحص الشارات
    if (user.totalAnswers === 1) {
      user.addBadge('أول إجابة', 'قدمت إجابتك الأولى! 🎉', '🎖️');
    }
    if (user.totalAnswers === 10) {
      user.addBadge('المساعد النشيط', 'قدمت 10 إجابات! 💪', '⭐');
    }
    if (user.totalAnswers === 50) {
      user.addBadge('المساعد الموثوق', 'قدمت 50 إجابة! 🏆', '👑');
    }

    await user.save();
    await question.save();
    await question.populate('answers.answeredBy', 'name email points rank');

    res.json({
      message: 'تم إضافة الإجابة بنجاح وحصلت على 10 نقاط!',
      question,
    });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في إضافة الإجابة', error: err.message });
  }
});

// إضافة إعجاب على إجابة
router.post('/:questionId/like-answer/:answerId', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) {
      return res.status(404).json({ message: 'السؤال غير موجود' });
    }

    const answer = question.answers.id(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ message: 'الإجابة غير موجودة' });
    }

    answer.likes += 1;
    await question.save();

    res.json({
      message: 'تم الإعجاب بالإجابة',
      question,
    });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الإعجاب', error: err.message });
  }
});

// Rate answer as useful or not useful
router.post('/:questionId/rate-answer/:answerId', auth, async (req, res) => {
  try {
    const { useful } = req.body; // boolean

    const question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).json({ message: 'السؤال غير موجود' });

    const answer = question.answers.id(req.params.answerId);
    if (!answer) return res.status(404).json({ message: 'الإجابة غير موجودة' });

    if (useful) {
      answer.usefulCount = (answer.usefulCount || 0) + 1;
      
      // منح نقاط إضافية للمجيب عند تقييم الإجابة كمفيدة
      const answerer = await User.findById(answer.answeredBy);
      if (answerer && answerer._id.toString() !== req.user.id) {
        answerer.points += 5;
        answerer.weeklyPoints += 5;
        answerer.helpfulAnswers += 1;
        answerer.updateRank();

        // فحص شارة الإجابات المفيدة
        if (answerer.helpfulAnswers === 5) {
          answerer.addBadge('الإجابات المفيدة', 'ساعدت 5 أشخاص بإجابات مفيدة! 🌟', '💡');
        }
        if (answerer.helpfulAnswers === 20) {
          answerer.addBadge('السفير المساعد', 'ساعدت 20 شخص بإجابات مفيدة! 🚀', '🌍');
        }

        await answerer.save();
      }
    } else {
      answer.notUsefulCount = (answer.notUsefulCount || 0) + 1;
    }

    await question.save();

    res.json({ message: 'تم تقييم الإجابة', question });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في تقييم الإجابة', error: err.message });
  }
});

module.exports = router;
