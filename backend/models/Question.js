const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: '',
  },
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    required: false,
  },
  attachments: [
    {
      url: String,
      filename: String,
      mimeType: String,
    },
  ],
  askedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    default: '',
  },
  answers: [
    {
      text: String,
      image: String,
      answeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      likes: {
        type: Number,
        default: 0,
      },
      usefulCount: {
        type: Number,
        default: 0,
      },
      notUsefulCount: {
        type: Number,
        default: 0,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  deadline: {
    type: Date,
    default: null,
  },
  solved: {
    type: Boolean,
    default: false,
  },
  points: {
    type: Number,
    default: 10,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Question', QuestionSchema);
