import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const PublicQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAnswer, setNewAnswer] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    fetchPublicQuestions();
  }, [token]);

  const fetchPublicQuestions = async () => {
    try {
      const response = await axios.get('/questions/public');
      setQuestions(response.data);
      setLoading(false);
    } catch (err) {
      console.error('خطأ في جلب الأسئلة:', err);
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
      fetchPublicQuestions();
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
      fetchPublicQuestions();
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
      fetchPublicQuestions();
    } catch (err) {
      console.error('خطأ في تقييم الإجابة:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 pt-20 pb-28">
        <div className="text-center py-8 sm:py-12 md:py-20">
          <div className="text-2xl sm:text-3xl md:text-4xl">⏳</div>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-2 sm:mt-4">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 pt-20 pb-28">
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">❓ الأسئلة العامة</h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">أسئلة من جميع المستخدمين حول جميع المواد</p>
        </div>

        {/* Questions List */}
        {questions.length === 0 ? (
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg p-6 sm:p-8 md:p-12 text-center">
            <p className="text-xs sm:text-sm md:text-base text-gray-600">📭 لا توجد أسئلة عامة حتى الآن</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">كن أول من يرفع سؤال عام!</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {questions.map((question) => (
              <div
                key={question._id}
                className="bg-white rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transition border-l-4 border-blue-500 p-3 sm:p-4 md:p-6"
              >
                {/* Question Header */}
                <div className="flex justify-between items-start mb-2 sm:mb-3 md:mb-4 gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800 mb-1 sm:mb-2 line-clamp-2 sm:line-clamp-3">
                      {question.title}
                    </h2>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 line-clamp-2 sm:line-clamp-3">{question.description}</p>
                  </div>
                  <span className="text-lg sm:text-2xl md:text-3xl flex-shrink-0">📌</span>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 text-xs sm:text-xs md:text-sm text-gray-500 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200">
                  <span className="truncate">👤 {question.askedBy?.name}</span>
                  <span className="truncate">📅 {new Date(question.createdAt).toLocaleDateString('ar-SA')}</span>
                  {question.subject && <span className="truncate">📖 {question.subject}</span>}
                  <span className="flex-shrink-0">🪙 {question.points}</span>
                </div>

                {/* Answers Section */}
                {question.answers.length > 0 && (
                  <div className="mb-4 sm:mb-6 bg-gray-50 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4">
                    <h3 className="font-bold text-xs sm:text-sm md:text-base text-gray-800 mb-2 sm:mb-4">
                      💬 الإجابات ({question.answers.length})
                    </h3>
                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                      {question.answers.map((answer, idx) => (
                        <div key={answer._id || idx} className="bg-white p-2 sm:p-3 md:p-4 rounded-lg border border-gray-200">
                          <p className="text-xs sm:text-sm md:text-base text-gray-700 mb-2 sm:mb-3 line-clamp-3">{answer.text}</p>
                          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 items-start sm:items-center justify-between">
                            <span className="text-xs text-gray-500 truncate">✍️ {answer.answeredBy?.name}</span>
                            <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-xs md:text-sm">
                              <button
                                onClick={() => handleLikeAnswer(question._id, answer._id)}
                                className="text-red-500 hover:text-red-700 transition whitespace-nowrap"
                              >
                                ❤️ ({answer.likes})
                              </button>
                              <button
                                onClick={() => handleRateAnswer(question._id, answer._id, true)}
                                className="text-green-600 hover:text-green-800 transition whitespace-nowrap"
                              >
                                👍 ({answer.usefulCount || 0})
                              </button>
                              <button
                                onClick={() => handleRateAnswer(question._id, answer._id, false)}
                                className="text-gray-600 hover:text-gray-800 transition whitespace-nowrap"
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

                {/* Answer Input */}
                {selectedQuestion === question._id ? (
                  <div className="bg-blue-50 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4">
                    <textarea
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      placeholder="اكتب إجابتك..."
                      className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-blue-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows="3"
                    />
                    <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-3">
                      <button
                        onClick={() => handleAnswerSubmit(question._id)}
                        className="flex-1 bg-blue-600 text-white py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-xs sm:text-sm"
                      >
                        ✓ إرسال الإجابة
                      </button>
                      <button
                        onClick={() => setSelectedQuestion(null)}
                        className="flex-1 bg-gray-300 text-gray-800 py-1.5 sm:py-2 rounded-lg hover:bg-gray-400 transition text-xs sm:text-sm"
                      >
                        ✕ إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedQuestion(question._id)}
                    className="w-full bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 py-2 sm:py-3 rounded-lg hover:from-blue-100 hover:to-blue-200 transition font-semibold border border-blue-300 text-xs sm:text-sm"
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

export default PublicQuestions;
