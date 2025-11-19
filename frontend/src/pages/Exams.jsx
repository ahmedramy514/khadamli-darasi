import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

const ExamsPage = () => {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [examQuestions, setExamQuestions] = useState([]);
  
  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    duration: 60,
    totalMarks: 100,
    startDate: '',
    endDate: '',
    questions: [{ question: '', type: 'essay', marks: 10, options: [], correctAnswer: '' }],
  });

  const [answers, setAnswers] = useState([]);
  const [examStartTime, setExamStartTime] = useState(null);

  useEffect(() => {
    if (classroomId) {
      fetchExams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomId]);

  const fetchExams = async () => {
    try {
      const response = await axios.get(`/exams/classroom/${classroomId}`);
      setExams(response.data);
      setLoading(false);
    } catch (err) {
      console.error('خطأ في جلب الامتحانات:', err);
      setLoading(false);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (!newExam.title || !newExam.startDate || !newExam.endDate) {
      alert('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      await axios.post('/exams', {
        ...newExam,
        classroomId,
      });
      setNewExam({
        title: '',
        description: '',
        duration: 60,
        totalMarks: 100,
        startDate: '',
        endDate: '',
        questions: [{ question: '', type: 'essay', marks: 10, options: [], correctAnswer: '' }],
      });
      setShowCreateModal(false);
      fetchExams();
      alert('تم إنشاء الامتحان بنجاح');
    } catch (err) {
      alert('خطأ: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleStartExam = (exam) => {
    setSelectedExam(exam);
    setExamStartTime(new Date());
    setAnswers(exam.questions.map((_, idx) => ({ questionIndex: idx, answer: '' })));
    setShowExamModal(true);
  };

  const handleSubmitExam = async () => {
    if (!confirm('هل أنت متأكد من تقديم الامتحان؟ لن تتمكن من التعديل بعد التقديم.')) return;

    try {
      await axios.post(`/exams/${selectedExam._id}/submit`, {
        answers,
        startedAt: examStartTime,
      });
      setShowExamModal(false);
      setSelectedExam(null);
      setAnswers([]);
      fetchExams();
      alert('تم تقديم الامتحان بنجاح');
    } catch (err) {
      alert('خطأ: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleViewSubmissions = async (exam) => {
    try {
      const response = await axios.get(`/exams/${exam._id}/submissions`);
      setSubmissions(response.data.submissions);
      setExamQuestions(response.data.questions);
      setSelectedExam(exam);
      setShowSubmissionsModal(true);
    } catch (err) {
      alert('خطأ: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleGradeSubmission = async (studentId, score, feedback) => {
    try {
      await axios.post(`/exams/${selectedExam._id}/grade`, {
        studentId,
        score,
        feedback,
      });
      alert('تم التصحيح بنجاح');
      handleViewSubmissions(selectedExam);
    } catch (err) {
      alert('خطأ: ' + (err.response?.data?.message || err.message));
    }
  };

  const addQuestion = () => {
    setNewExam({
      ...newExam,
      questions: [
        ...newExam.questions,
        { question: '', type: 'essay', marks: 10, options: [], correctAnswer: '' },
      ],
    });
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...newExam.questions];
    updated[index][field] = value;
    setNewExam({ ...newExam, questions: updated });
  };

  const removeQuestion = (index) => {
    const updated = newExam.questions.filter((_, i) => i !== index);
    setNewExam({ ...newExam, questions: updated });
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const start = new Date(exam.startDate);
    const end = new Date(exam.endDate);
    const submission = exam.submissions?.find(s => s.student._id === user?.id || s.student === user?.id);

    if (submission) return { label: '✓ مكتمل', color: 'green' };
    if (now < start) return { label: '⏳ لم يبدأ', color: 'gray' };
    if (now > end) return { label: '⚠️ منتهي', color: 'red' };
    return { label: '🔴 متاح الآن', color: 'blue' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin text-4xl">⏳</div>
          <p className="text-gray-600 mt-4">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 pt-20 pb-28">
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">📝 الامتحانات</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">إدارة الامتحانات والاختبارات</p>
          </div>
          {user?.role === 'teacher' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:shadow-lg transition font-semibold text-sm sm:text-base whitespace-nowrap"
            >
              ➕ إنشاء امتحان
            </button>
          )}
        </div>

        {/* Exams Grid */}
        {exams.length === 0 ? (
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-md p-8 sm:p-12 text-center">
            <p className="text-gray-600 text-base sm:text-lg">📭 لا توجد امتحانات حتى الآن</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {exams.map((exam) => {
              const status = getExamStatus(exam);
              const submission = exam.submissions?.find(s => s.student._id === user?.id || s.student === user?.id);

              return (
                <div
                  key={exam._id}
                  className={`bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition border-t-4 ${
                    status.color === 'green' ? 'border-green-500' :
                    status.color === 'red' ? 'border-red-500' :
                    status.color === 'blue' ? 'border-blue-500' : 'border-gray-500'
                  } overflow-hidden`}
                >
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 truncate">{exam.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{exam.description}</p>
                  </div>

                  <div className="p-3 sm:p-4">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                        <span>⏱️</span>
                        <span>{exam.duration} دقيقة</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                        <span>📊</span>
                        <span>{exam.totalMarks} درجة</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                        <span>❓</span>
                        <span>{exam.questions?.length || 0} سؤال</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                        <span>📅</span>
                        <span>{new Date(exam.startDate).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>

                    <div className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-semibold mb-4 ${
                      status.color === 'green' ? 'bg-green-100 text-green-700' :
                      status.color === 'red' ? 'bg-red-100 text-red-700' :
                      status.color === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {status.label}
                    </div>

                    {submission && submission.gradedAt && (
                      <div className="bg-green-50 border border-green-200 p-2 sm:p-3 rounded-lg mb-4">
                        <p className="text-xs sm:text-sm font-bold text-green-800">
                          🎖️ الدرجة: {submission.score} / {exam.totalMarks}
                        </p>
                        {submission.feedback && (
                          <p className="text-xs text-gray-700 mt-1">💬 {submission.feedback}</p>
                        )}
                      </div>
                    )}

                    {submission && !submission.gradedAt && (
                      <div className="bg-yellow-50 border border-yellow-200 p-2 sm:p-3 rounded-lg mb-4">
                        <p className="text-xs sm:text-sm text-yellow-700">⏳ في انتظار التصحيح...</p>
                      </div>
                    )}

                    <div className="border-t pt-3">
                      {user?.role === 'teacher' ? (
                        <button
                          onClick={() => handleViewSubmissions(exam)}
                          className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition font-semibold text-xs sm:text-sm"
                        >
                          📊 عرض التقديمات ({exam.submissions?.length || 0})
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartExam(exam)}
                          disabled={submission || new Date() < new Date(exam.startDate) || new Date() > new Date(exam.endDate)}
                          className={`w-full py-2 rounded-lg transition font-semibold text-xs sm:text-sm ${
                            submission || new Date() < new Date(exam.startDate) || new Date() > new Date(exam.endDate)
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {submission ? '✓ تم التقديم' : '📝 بدء الامتحان'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg sm:rounded-2xl p-4 sm:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl my-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">إنشاء امتحان جديد</h2>

            <form onSubmit={handleCreateExam} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">العنوان</label>
                  <input
                    type="text"
                    value={newExam.title}
                    onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">المدة (دقيقة)</label>
                  <input
                    type="number"
                    value={newExam.duration}
                    onChange={(e) => setNewExam({ ...newExam, duration: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">إجمالي الدرجات</label>
                  <input
                    type="number"
                    value={newExam.totalMarks}
                    onChange={(e) => setNewExam({ ...newExam, totalMarks: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">تاريخ البدء</label>
                  <input
                    type="datetime-local"
                    value={newExam.startDate}
                    onChange={(e) => setNewExam({ ...newExam, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">تاريخ الانتهاء</label>
                  <input
                    type="datetime-local"
                    value={newExam.endDate}
                    onChange={(e) => setNewExam({ ...newExam, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف</label>
                  <textarea
                    value={newExam.description}
                    onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"
                    rows="3"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">الأسئلة</h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
                  >
                    ➕ إضافة سؤال
                  </button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {newExam.questions.map((q, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-semibold text-gray-700">سؤال {idx + 1}</span>
                        {newExam.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(idx)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            ✕ حذف
                          </button>
                        )}
                      </div>

                      <textarea
                        value={q.question}
                        onChange={(e) => updateQuestion(idx, 'question', e.target.value)}
                        placeholder="اكتب السؤال..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 resize-none"
                        rows="2"
                        required
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">النوع</label>
                          <select
                            value={q.type}
                            onChange={(e) => updateQuestion(idx, 'type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="essay">مقالي</option>
                            <option value="mcq">اختيار من متعدد</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">الدرجة</label>
                          <input
                            type="number"
                            value={q.marks}
                            onChange={(e) => updateQuestion(idx, 'marks', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            required
                          />
                        </div>
                      </div>

                      {/* MCQ Options */}
                      {q.type === 'mcq' && (
                        <div className="mt-3">
                          <label className="block text-xs font-semibold text-gray-700 mb-2">الخيارات (اكتب كل خيار في سطر)</label>
                          <textarea
                            value={q.options?.join('\n') || ''}
                            onChange={(e) => updateQuestion(idx, 'options', e.target.value.split('\n').filter(o => o.trim()))}
                            placeholder="الخيار الأول\nالخيار الثاني\nالخيار الثالث\nالخيار الرابع"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                            rows="4"
                          />
                          
                          <div className="mt-2">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">الإجابة الصحيحة</label>
                            <select
                              value={q.correctAnswer || ''}
                              onChange={(e) => updateQuestion(idx, 'correctAnswer', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                              <option value="">اختر الإجابة الصحيحة</option>
                              {q.options?.map((opt, optIdx) => (
                                <option key={optIdx} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold text-sm"
                >
                  ✓ إنشاء الامتحان
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 text-sm font-semibold"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Take Exam Modal */}
      {showExamModal && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg sm:rounded-2xl p-4 sm:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl my-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">{selectedExam.title}</h2>
                <p className="text-sm text-gray-600 mt-1">⏱️ الوقت المتاح: {selectedExam.duration} دقيقة</p>
              </div>
              <span className="text-2xl">📝</span>
            </div>

            <div className="space-y-6">
              {selectedExam.questions.map((q, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    {idx + 1}. {q.question} ({q.marks} درجة)
                  </h3>

                  {q.type === 'mcq' && q.options && q.options.length > 0 ? (
                    <div className="space-y-2">
                      {q.options.map((option, optIdx) => (
                        <label key={optIdx} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`question-${idx}`}
                            value={option}
                            checked={answers[idx]?.answer === option}
                            onChange={(e) => {
                              const updated = [...answers];
                              updated[idx] = { questionIndex: idx, answer: e.target.value };
                              setAnswers(updated);
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      value={answers[idx]?.answer || ''}
                      onChange={(e) => {
                        const updated = [...answers];
                        updated[idx] = { questionIndex: idx, answer: e.target.value };
                        setAnswers(updated);
                      }}
                      placeholder="اكتب إجابتك هنا..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                      rows="4"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmitExam}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold text-sm"
              >
                ✓ تقديم الامتحان
              </button>
              <button
                onClick={() => {
                  if (confirm('هل أنت متأكد؟ سيتم إلغاء جميع الإجابات.')) {
                    setShowExamModal(false);
                    setSelectedExam(null);
                    setAnswers([]);
                  }
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 text-sm font-semibold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Submissions Modal (Teacher) */}
      {showSubmissionsModal && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg sm:rounded-2xl p-4 sm:p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl my-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">{selectedExam.title}</h2>
                <p className="text-sm text-gray-600 mt-1">تقديمات الطلاب ({submissions.length})</p>
              </div>
              <button
                onClick={() => setShowSubmissionsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {submissions.length === 0 ? (
              <div className="text-center py-8 text-gray-600">لا توجد تقديمات حتى الآن</div>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => (
                  <div key={sub._id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-gray-800">{sub.student?.name}</h3>
                        <p className="text-xs text-gray-600">
                          تم التقديم: {new Date(sub.submittedAt).toLocaleString('ar-SA')}
                        </p>
                      </div>
                      {sub.gradedAt ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                          ✓ مصحح: {sub.score}/{selectedExam.totalMarks}
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                          ⏳ بانتظار التصحيح
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 mb-4">
                      {sub.answers.map((ans, idx) => {
                        const question = examQuestions[ans.questionIndex];
                        return (
                          <div key={idx} className="bg-white p-3 rounded border">
                            <p className="text-sm font-semibold text-gray-700 mb-1">
                              {ans.questionIndex + 1}. {question?.question}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>الإجابة:</strong> {ans.answer}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {!sub.gradedAt && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">الدرجة</label>
                            <input
                              type="number"
                              max={selectedExam.totalMarks}
                              min="0"
                              id={`score-${sub._id}`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder={`من ${selectedExam.totalMarks}`}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">التعليق</label>
                            <input
                              type="text"
                              id={`feedback-${sub._id}`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="تعليق اختياري..."
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const score = Number(document.getElementById(`score-${sub._id}`).value);
                            const feedback = document.getElementById(`feedback-${sub._id}`).value;
                            if (!score && score !== 0) {
                              alert('الرجاء إدخال الدرجة');
                              return;
                            }
                            handleGradeSubmission(sub.student._id, score, feedback);
                          }}
                          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold text-sm"
                        >
                          ✓ تصحيح وحفظ الدرجة
                        </button>
                      </div>
                    )}

                    {sub.gradedAt && sub.feedback && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>💬 التعليق:</strong> {sub.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamsPage;
