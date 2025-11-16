import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ClassroomDetail = () => {
  const { classroomId } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    // Wait until token is available to avoid making unauthenticated requests
    if (!token) return;
    fetchClassroom();
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomId, token]);

  const fetchClassroom = async () => {
    try {
      const response = await axios.get(`/classrooms/${classroomId}`);
      setClassroom(response.data);
    } catch (err) {
      console.error('خطأ:', err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(
        `/questions/classroom/${classroomId}`
      );
      setQuestions(response.data);
      setLoading(false);
    } catch (err) {
      console.error('خطأ:', err);
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (questionId) => {
    if (!newAnswer.trim()) return;

    try {
      await axios.post(
        `/questions/${questionId}/answer`,
        { text: newAnswer }
      );

      setNewAnswer('');
      setSelectedQuestion(null);
      fetchQuestions();
    } catch (err) {
      alert('خطأ: ' + err.response?.data?.message);
    }
  };

  const handleLikeAnswer = async (questionId, answerId) => {
    try {
      await axios.post(
        `/questions/${questionId}/like-answer/${answerId}`,
        {}
      );
      fetchQuestions();
    } catch (err) {
      console.error('خطأ:', err);
    }
  };

  const handleRateAnswer = async (questionId, answerId, useful) => {
    try {
      await axios.post(
        `/questions/${questionId}/rate-answer/${answerId}`,
        { useful }
      );
      fetchQuestions();
    } catch (err) {
      console.error('خطأ في تقييم الإجابة:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin text-3xl sm:text-4xl">⏳</div>
          <p className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-4">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 pb-28 pt-20">
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-8">
        {/* رأس الفصل */}
        {classroom && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg sm:rounded-2xl p-3 sm:p-6 mb-4 sm:mb-6">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 truncate">{classroom.name}</h1>
            <p className="text-xs sm:text-sm text-blue-100 mb-2 sm:mb-4 line-clamp-2">{classroom.description}</p>
            <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
              <div>
                <p className="text-xs text-blue-100">المادة</p>
                <p className="font-semibold truncate">{classroom.subject}</p>
              </div>
              <div>
                <p className="text-xs text-blue-100">الطلاب</p>
                <p className="font-semibold">{classroom.students.length}</p>
              </div>
              <div>
                <p className="text-xs text-blue-100">رمز الفصل</p>
                <p className="font-semibold font-mono">{classroom.code}</p>
              </div>
            </div>
          </div>
        )}

        {/* قائمة الأسئلة */}
        <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">❓ الأسئلة</h2>

        {questions.length === 0 ? (
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg p-6 sm:p-8 text-center">
            <p className="text-xs sm:text-sm md:text-base text-gray-600">لا توجد أسئلة حتى الآن</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {questions.map((question) => (
              <div
                key={question._id}
                className="bg-white rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6 border-r-4 border-blue-500"
              >
                {/* السؤال */}
                <div className="mb-3 sm:mb-4">
                  <h3 className="text-sm sm:text-lg md:text-xl font-bold text-gray-800 mb-1 sm:mb-2 line-clamp-2">
                    {question.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-3">{question.description}</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-3 text-xs text-gray-500">
                    <span className="truncate">👤 {question.askedBy.name}</span>
                    <span className="truncate">📅 {new Date(question.createdAt).toLocaleDateString('ar-SA')}</span>
                    <span className="flex-shrink-0">🪙 {question.points}</span>
                  </div>
                </div>

                {/* الإجابات */}
                {question.answers.length > 0 && (
                  <div className="bg-gray-50 rounded-lg sm:rounded-xl p-2 sm:p-4 mb-3 sm:mb-4">
                    <h4 className="font-semibold text-xs sm:text-sm md:text-base text-gray-800 mb-2 sm:mb-3">
                      📝 الإجابات ({question.answers.length})
                    </h4>
                    <div className="space-y-2 sm:space-y-3">
                      {question.answers.map((answer, idx) => (
                        <div
                          key={answer._id || idx}
                          className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200"
                        >
                          <p className="text-xs sm:text-sm text-gray-700 mb-2 line-clamp-3">{answer.text}</p>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 sm:gap-2">
                            <span className="text-xs text-gray-500 truncate">
                              ✍️ {answer.answeredBy?.name}
                            </span>
                            <div className="flex flex-wrap gap-1 sm:gap-2 text-xs">
                              <button
                                onClick={() => handleLikeAnswer(question._id, answer._id)}
                                className="text-red-500 hover:text-red-700 whitespace-nowrap"
                              >
                                ❤️ ({answer.likes})
                              </button>
                              <button
                                onClick={() => handleRateAnswer(question._id, answer._id, true)}
                                className="text-green-600 hover:text-green-800 whitespace-nowrap"
                              >
                                👍 ({answer.usefulCount || 0})
                              </button>
                              <button
                                onClick={() => handleRateAnswer(question._id, answer._id, false)}
                                className="text-gray-600 hover:text-gray-800 whitespace-nowrap"
                              >
                                👎 ({answer.notUsefulCount || 0})
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* إضافة إجابة */}
                {selectedQuestion === question._id ? (
                  <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                    <textarea
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      placeholder="اكتب إجابتك..."
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm resize-none"
                      rows="3"
                    />
                    <div className="flex gap-2 sm:gap-3 flex-col sm:flex-row">
                      <button
                        onClick={() => handleAnswerSubmit(question._id)}
                        className="flex-1 bg-blue-500 text-white py-1.5 sm:py-2 rounded-lg hover:bg-blue-600 transition font-semibold text-xs sm:text-sm"
                      >
                        ✓ إرسال الإجابة
                      </button>
                      <button
                        onClick={() => setSelectedQuestion(null)}
                        className="flex-1 bg-gray-300 text-gray-800 py-1.5 sm:py-2 rounded-lg hover:bg-gray-400 text-xs sm:text-sm"
                      >
                        ✕ إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedQuestion(question._id)}
                    className="w-full bg-blue-50 text-blue-600 py-1.5 sm:py-2 rounded-lg hover:bg-blue-100 transition font-semibold text-xs sm:text-sm"
                  >
                    💬 أجب على السؤال
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomDetail;
