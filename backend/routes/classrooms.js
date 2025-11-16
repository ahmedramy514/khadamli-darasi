const express = require('express');
const Classroom = require('../models/Classroom');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// إنشاء فصل دراسي جديد
router.post('/', auth, async (req, res) => {
  try {
    // Only teachers can create classrooms
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'غير مسموح: فقط المعلمون يمكنهم إنشاء الفصول' });
    }
    const { name, description, subject } = req.body;

    const classroom = new Classroom({
      name,
      description,
      subject,
      code: uuidv4().substring(0, 8).toUpperCase(),
      teacher: req.user.id,
    });

    await classroom.save();
    await classroom.populate('teacher', 'name email');

    res.status(201).json({
      message: 'تم إنشاء الفصل بنجاح',
      classroom,
    });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في إنشاء الفصل', error: err.message });
  }
});

// الحصول على جميع الفصول للمستخدم الحالي
router.get('/', auth, async (req, res) => {
  try {
    const classrooms = await Classroom.find({
      $or: [{ teacher: req.user.id }, { students: req.user.id }],
    })
      .populate('teacher', 'name email')
      .populate('students', 'name email');

    res.json(classrooms);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب الفصول', error: err.message });
  }
});

// الانضمام إلى فصل دراسي
router.post('/join/:code', auth, async (req, res) => {
  try {
    const classroom = await Classroom.findOne({ code: req.params.code });

    if (!classroom) {
      return res.status(404).json({ message: 'الفصل غير موجود' });
    }

    if (classroom.students.includes(req.user.id)) {
      return res.status(400).json({ message: 'أنت منضم بالفعل لهذا الفصل' });
    }

    classroom.students.push(req.user.id);
    await classroom.save();
    await classroom.populate('teacher', 'name email');
    await classroom.populate('students', 'name email');

    res.json({
      message: 'تم الانضمام للفصل بنجاح',
      classroom,
    });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الانضمام', error: err.message });
  }
});

// الحصول على فصل واحد
router.get('/:id', auth, async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .populate('teacher', 'name email')
      .populate('students', 'name email points rank');

    if (!classroom) {
      return res.status(404).json({ message: 'الفصل غير موجود' });
    }

    res.json(classroom);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب الفصل', error: err.message });
  }
});

module.exports = router;
