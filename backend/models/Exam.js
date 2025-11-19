const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  duration: {
    type: Number, // مدة الامتحان بالدقائق
    required: true,
  },
  totalMarks: {
    type: Number,
    default: 100,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  questions: [
    {
      question: String,
      type: {
        type: String,
        enum: ['essay', 'mcq'], // مقالي أو اختيار من متعدد
        default: 'essay',
      },
      options: [String], // للاختيار من متعدد
      correctAnswer: String, // للاختيار من متعدد
      marks: {
        type: Number,
        default: 10,
      },
    },
  ],
  submissions: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      answers: [
        {
          questionIndex: Number,
          answer: String,
        },
      ],
      score: {
        type: Number,
        default: 0,
      },
      feedback: String,
      submittedAt: {
        type: Date,
        default: Date.now,
      },
      gradedAt: Date,
      startedAt: Date,
      completedAt: Date,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Exam', ExamSchema);
