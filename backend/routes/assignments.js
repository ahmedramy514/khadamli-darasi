const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Classroom = require('../models/Classroom');
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

// GET /api/assignments - list assignments for the current user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    if (req.user.role === 'teacher') {
      // Return assignments for classrooms this teacher owns
      const classes = await Classroom.find({ teacher: userId }).select('_id');
      const classIds = classes.map(c => c._id);
      const assignments = await Assignment.find({ classroom: { $in: classIds } })
        .populate('submissions.student', 'name email')
        .lean();
      return res.json(assignments);
    }

    // student: return assignments for classrooms they belong to
    const classes = await Classroom.find({ students: userId }).select('_id');
    const classIds = classes.map(c => c._id);
    const assignments = await Assignment.find({ classroom: { $in: classIds } })
      .populate('submissions.student', 'name email')
      .lean();
    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'فشل جلب الواجبات' });
  }
});

// GET /api/assignments/classroom/:classroomId - get assignments for a specific classroom
router.get('/classroom/:classroomId', auth, async (req, res) => {
  try {
    const { classroomId } = req.params;
    const assignments = await Assignment.find({ classroom: classroomId })
      .populate('createdBy', 'name email')
      .populate('submissions.student', 'name email')
      .lean();
    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'فشل جلب الواجبات' });
  }
});

// POST /api/assignments - create a new assignment (teacher only)
// accept optional attachment when creating an assignment
router.post('/', auth, upload.single('attachment'), async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'غير مسموح' });

    const { title, description, classroomId, deadline } = req.body;
    if (!title || !classroomId || !deadline) {
      return res.status(400).json({ message: 'الحقول مطلوبة' });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) return res.status(404).json({ message: 'الفصل غير موجود' });
    if (String(classroom.teacher) !== String(req.user.id)) return res.status(403).json({ message: 'لست معلم هذا الفصل' });

    const assignment = new Assignment({
      title,
      description,
      classroom: classroomId,
      createdBy: req.user.id,
      deadline,
      attachments: [],
    });
    if (req.file) {
      assignment.attachments.push(`/uploads/${req.file.filename}`);
    }

    await assignment.save();
    res.status(201).json({ message: 'تم إنشاء الواجب', assignment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'فشل إنشاء الواجب' });
  }
});

// POST /api/assignments/:id/submit - student submits an assignment
// students can submit with optional attachment
router.post('/:id/submit', auth, upload.single('attachment'), async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'غير مسموح' });
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'الواجب غير موجود' });

    const { content } = req.body;
    // replace existing submission for this student or push a new one
    const existing = assignment.submissions.find(s => String(s.student) === String(req.user.id));
    if (existing) {
      existing.content = content || existing.content;
      existing.attachments = existing.attachments || [];
      if (req.file) existing.attachments.push(`/uploads/${req.file.filename}`);
      existing.submittedAt = new Date();
    } else {
      const sub = { student: req.user.id, content: content || '' };
      if (req.file) sub.attachments = [`/uploads/${req.file.filename}`];
      assignment.submissions.push(sub);
    }

    await assignment.save();
    res.json({ message: 'تم الإرسال' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'فشل الإرسال' });
  }
});

// GET /api/assignments/:id/submissions - teacher views submissions
router.get('/:id/submissions', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('submissions.student', 'name email');
    if (!assignment) return res.status(404).json({ message: 'الواجب غير موجود' });

    const classroom = await Classroom.findById(assignment.classroom);
    if (!classroom) return res.status(404).json({ message: 'الفصل غير موجود' });
    if (String(classroom.teacher) !== String(req.user.id) && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'غير مسموح' });
    }

    res.json({ submissions: assignment.submissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'فشل جلب التقديمات' });
  }
});

// POST /api/assignments/:id/grade - teacher grades a student's submission
router.post('/:id/grade', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'غير مسموح' });
    const { studentId, grade = 0, feedback = '', correct = false } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'الواجب غير موجود' });

    const classroom = await Classroom.findById(assignment.classroom);
    if (!classroom) return res.status(404).json({ message: 'الفصل غير موجود' });
    if (String(classroom.teacher) !== String(req.user.id)) return res.status(403).json({ message: 'لست معلم هذا الفصل' });

    const submission = assignment.submissions.find(s => String(s.student) === String(studentId));
    if (!submission) return res.status(404).json({ message: 'تقديم الطالب غير موجود' });

    submission.grade = grade;
    submission.feedback = feedback;
    submission.gradedAt = new Date();

    await assignment.save();

    // If marked correct, award points to student
    if (correct) {
      const user = await User.findById(studentId);
      if (user) {
        const pointsToAdd = 10; // simple fixed points per correct assignment
        user.points = (user.points || 0) + pointsToAdd;
        user.weeklyPoints = (user.weeklyPoints || 0) + pointsToAdd;
        await user.save();
      }
    }

    res.json({ message: 'تم التقييم' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'فشل تقييم التقديم' });
  }
});

module.exports = router;
