import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(true);
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClassrooms();
    }, [token]);

  const fetchClassrooms = async () => {
    try {
      const response = await axios.get('/classrooms');
      setClassrooms(response.data);
      setLoading(false);
    } catch (err) {
      console.error('خطأ في جلب الفصول:', err);
      setLoading(false);
    }
  };

  const handleJoinClassroom = async () => {
    if (!classCode.trim()) return;

    try {
      const response = await axios.post(
        `/classrooms/join/${classCode}`,
        {}
      );
      setClassrooms([...classrooms, response.data.classroom]);
      setClassCode('');
      setShowJoinModal(false);
    } catch (err) {
      alert('خطأ: ' + (err.response?.data?.message || 'حدث خطأ'));
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 pt-20 pb-28">
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-8">
        {/* Welcome Header */}
        <div className="mb-4 sm:mb-8 md:mb-12">
          <h1 className="text-xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-1 sm:mb-2 md:mb-3 truncate">
            مرحباً، {user?.name} 👋
          </h1>
          <p className="text-xs sm:text-sm md:text-lg text-gray-600">أنت الآن في {user?.role === 'teacher' ? 'صفة معلم' : 'صفة طالب'}</p>
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg p-2 sm:p-4 md:p-6 mb-4 sm:mb-8 md:mb-12">
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 md:gap-4">
            {user?.role === 'teacher' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:shadow-lg transition font-semibold text-xs sm:text-sm"
              >
                <span>➕</span>
                <span>إنشاء فصل</span>
              </button>
            )}
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:shadow-lg transition font-semibold text-xs sm:text-sm"
            >
              <span>🔑</span>
              <span>دخول برمز</span>
            </button>
            <button
              onClick={() => navigate('/public-questions')}
              className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:shadow-lg transition font-semibold text-xs sm:text-sm"
            >
              <span>❓</span>
              <span>الأسئلة العامة</span>
            </button>
          </div>
        </div>

        {/* Classrooms Section */}
        <div className="mb-8">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-6">📚 فصولك الدراسية</h2>
          {classrooms.length === 0 ? (
            <div className="bg-white rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg p-6 sm:p-8 md:p-12 text-center">
              <p className="text-xs sm:text-sm md:text-base text-gray-600">لم تنضم لأي فصل حتى الآن</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-6">
              {classrooms.map((classroom) => (
                <div
                  key={classroom._id}
                  onClick={() => navigate(`/classroom/${classroom._id}`)}
                  className="bg-white rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transition cursor-pointer border-t-4 border-blue-500 overflow-hidden group"
                >
                  <div className="p-2 sm:p-4 md:p-6">
                    <div className="flex justify-between items-start mb-2 sm:mb-4 gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-lg md:text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition truncate">
                          {classroom.name}
                        </h3>
                        <p className="text-xs sm:text-sm md:text-base text-blue-600 font-semibold mt-0.5 sm:mt-1 truncate">{classroom.subject}</p>
                      </div>
                      <span className="text-xl sm:text-2xl md:text-4xl flex-shrink-0">📖</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4 line-clamp-2">{classroom.description}</p>
                    <div className="flex flex-wrap gap-2 sm:gap-4 mb-2 sm:mb-4 pb-2 sm:pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                        <span>👥</span>
                        <span>{classroom.students.length}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                        <span>🔐</span>
                        <span className="font-mono truncate">{classroom.code}</span>
                      </div>
                    </div>
                    <button onClick={() => navigate(`/classroom/${classroom._id}`)} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-1.5 sm:py-2 rounded-lg hover:shadow-md transition font-semibold text-xs sm:text-sm">
                      الدخول →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-2 mb-3 sm:mb-6">
              <span className="text-2xl sm:text-3xl">🔑</span>
              <h3 className="text-lg sm:text-2xl font-bold text-gray-800">دخول فصل</h3>
            </div>
            <input
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              placeholder="أدخل رمز الفصل"
              className="w-full px-2 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl mb-2 sm:mb-4 focus:outline-none focus:border-blue-500 text-center text-xs sm:text-lg font-mono"
            />
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 text-center">اطلب من معلمك رمز الفصل المكون من 8 أحرف</p>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={handleJoinClassroom}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl hover:shadow-lg transition font-semibold text-xs sm:text-sm"
              >
                الدخول
              </button>
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-gray-300 transition font-semibold text-xs sm:text-sm"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">إنشاء فصل جديد</h3>
            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="اسم الفصل"
                className="w-full px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="المادة"
                className="w-full px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="وصف قصير للفصل (اختياري)"
                className="w-full px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-blue-500 resize-none"
                rows="3"
              />
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={async () => {
                  if (!newName.trim() || !newSubject.trim()) {
                    alert('الرجاء ملء اسم الفصل والمادة');
                    return;
                  }
                  try {
                    const response = await axios.post(
                      '/classrooms',
                      { name: newName, subject: newSubject, description: newDescription }
                    );
                    setClassrooms([response.data.classroom, ...classrooms]);
                    setNewName('');
                    setNewSubject('');
                    setNewDescription('');
                    setShowCreateModal(false);
                  } catch (err) {
                    alert('خطأ في إنشاء الفصل: ' + (err.response?.data?.message || err.message));
                  }
                }}
                className="flex-1 bg-green-600 text-white py-2 sm:py-3 rounded-lg hover:bg-green-700 font-semibold text-xs sm:text-sm"
              >
                إنشاء
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-300 text-gray-800 py-2 sm:py-3 rounded-lg hover:bg-gray-400 font-semibold text-xs sm:text-sm"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
