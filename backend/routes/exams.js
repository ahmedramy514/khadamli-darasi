const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const Classroom = require('../models/Classroom');
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/exams/classroom/:classroomId - جلب امتحانات الفصل
router.get('/classroom/:classroomId', auth, async (req, res) => {
  try {
    const { classroomId } = req.params;
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) return res.status(404).json({ message: 'الفصل غير موجود' });

    const exams = await Exam.find({ classroom: classroomId })
      .populate('createdBy', 'name email')
      .lean();

    // إخفاء الإجابات الصحيحة عن الطلاب
    if (req.user.role === 'student') {
      exams.forEach(exam => {
        exam.questions = exam.questions.map(q => ({
          question: q.question,
          type: q.type,
          options: q.options,
          marks: q.marks,
          _id: q._id,
        }));
      });
    }

    res.json(exams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'فشل جلب الامتحانات' });
  }
});

// POST /api/exams - إنشاء امتحان جديد (معلم فقط)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'غير مسموح' });
    }

    const { title, description, classroomId, duration, totalMarks, startDate, endDate, questions } = req.body;

    if (!title || !classroomId || !duration || !startDate || !endDate || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) return res.status(404).json({ message: 'الفصل غير موجود' });
    if (String(classroom.teacher) !== String(req.user.id)) {
      return res.status(403).json({ message: 'لست معلم هذا الفصل' });
    }

    const exam = new Exam({
      title,
      description,
      classroom: classroomId,
      createdBy: req.user.id,
      duration,
      totalMarks: totalMarks || 100,
      startDate,
      endDate,
      questions,
    });

    await exam.save();
    res.status(201).json({ message: 'تم إنشاء الامتحان', exam });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'فشل إنشاء الامتحان' });
  }
});

// GET /api/exams/:id - جلب تفاصيل امتحان
router.get('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('submissions.student', 'name email')
      .lean();

    if (!exam) return res.status(404).json({ message: 'الامتحان غير موجود' });

    // إخفاء الإجابات الصحيحة عن الطلاب
    if (req.user.role === 'student') {
      exam.questions = exam.questions.map(q => ({
        question: q.question,
        type: q.type,
        options: q.options,
        marks: q.marks,
        _id: q._id,
      }));
      // إظهار فقط تقديم الطالب نفسه
      exam.submissions = exam.submissions.filter(
        s => String(s.student._id) === String(req.user.id)
      );
    }

    res.json(exam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'فشل جلب الامتحان' });
  }
});

// POST /api/exams/:id/submit - تقديم إجابات الامتحان (طالب فقط)
router.post('/:id/submit', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'غير مسموح' });
    }

    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'الامتحان غير موجود' });

    const now = new Date();
    if (now < new Date(exam.startDate)) {
      return res.status(400).json({ message: 'الامتحان لم يبدأ بعد' });
    }
    if (now > new Date(exam.endDate)) {
      return res.status(400).json({ message: 'انتهى موعد الامتحان' });
    }

    const { answers, startedAt } = req.body;

    // التحقق من عدم وجود تقديم سابق
    const existingSubmission = exam.submissions.find(
      s => String(s.student) === String(req.user.id)
    );
    if (existingSubmission) {
      return res.status(400).json({ message: 'لقد قمت بتقديم الامتحان من قبل' });
    }

    // حساب الدرجة التلقائية للأسئلة MCQ
    let autoScore = 0;
    exam.questions.forEach((q, idx) => {
      if (q.type === 'mcq') {
        const studentAnswer = answers.find(a => a.questionIndex === idx);
        if (studentAnswer && studentAnswer.answer === q.correctAnswer) {
          autoScore += q.marks;
        }
      }
    });

    exam.submissions.push({
      student: req.user.id,
      answers,
      score: autoScore,
      startedAt: startedAt || now,
      completedAt: now,
      submittedAt: now,
    });

    await exam.save();
    res.json({ message: 'تم تقديم الامتحان', autoScore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'فشل تقديم الامتحان' });
  }
});

// POST /api/exams/:id/grade - تصحيح امتحان طالب (معلم فقط)
router.post('/:id/grade', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'غير مسموح' });
    }

    const { studentId, score, feedback } = req.body;
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'الامتحان غير موجود' });

    const classroom = await Classroom.findById(exam.classroom);
    if (!classroom) return res.status(404).json({ message: 'الفصل غير موجود' });
    if (String(classroom.teacher) !== String(req.user.id)) {
      return res.status(403).json({ message: 'لست معلم هذا الفصل' });
    }

    const submission = exam.submissions.find(
      s => String(s.student) === String(studentId)
    );
    if (!submission) {
      return res.status(404).json({ message: 'تقديم الطالب غير موجود' });
    }

    submission.score = score;
    submission.feedback = feedback;
    submission.gradedAt = new Date();

    await exam.save();

    // إضافة نقاط للطالب بناءً على الدرجة
    const user = await User.findById(studentId);
    if (user) {
      const percentage = (score / exam.totalMarks) * 100;
      let pointsToAdd = 0;
      if (percentage >= 90) pointsToAdd = 20;
      else if (percentage >= 80) pointsToAdd = 15;
      else if (percentage >= 70) pointsToAdd = 10;
      else if (percentage >= 60) pointsToAdd = 5;

      if (pointsToAdd > 0) {
        user.points = (user.points || 0) + pointsToAdd;
        user.weeklyPoints = (user.weeklyPoints || 0) + pointsToAdd;
        await user.save();
      }
    }

    res.json({ message: 'تم التصحيح بنجاح' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'فشل التصحيح' });
  }
});

// GET /api/exams/:id/submissions - عرض جميع التقديمات (معلم فقط)
router.get('/:id/submissions', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'غير مسموح' });
    }

    const exam = await Exam.findById(req.params.id)
      .populate('submissions.student', 'name email');
    if (!exam) return res.status(404).json({ message: 'الامتحان غير موجود' });

    const classroom = await Classroom.findById(exam.classroom);
    if (!classroom) return res.status(404).json({ message: 'الفصل غير موجود' });
    if (String(classroom.teacher) !== String(req.user.id)) {
      return res.status(403).json({ message: 'لست معلم هذا الفصل' });
    }

    res.json({ submissions: exam.submissions, questions: exam.questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'فشل جلب التقديمات' });
  }
});

module.exports = router;
