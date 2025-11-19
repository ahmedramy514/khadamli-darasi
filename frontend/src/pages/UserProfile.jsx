import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const UserProfile = () => {
  const { user } = useContext(AuthContext);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchUserStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/users/${user.id}`);
      setUserStats(res.data);
      setFormData({
        name: res.data.name,
        bio: res.data.bio,
        schoolName: res.data.schoolName,
      });
    } catch (err) {
      console.error('خطأ في جلب البيانات:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/users/${user.id}`, formData);
      setUserStats(res.data.user);
      setEditMode(false);
      // Refresh to get updated stats
      fetchUserStats();
    } catch (err) {
      console.error('خطأ في التحديث:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin text-3xl sm:text-4xl md:text-5xl">⏳</div>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-2 sm:mt-4">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center pt-20">
        <p className="text-xs sm:text-sm md:text-base text-gray-600">خطأ في تحميل البيانات</p>
      </div>
    );
  }

  const stats = userStats.stats || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-28 pt-20">
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 md:px-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg overflow-hidden mb-4 sm:mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-16 sm:h-24 md:h-32"></div>

          <div className="px-3 sm:px-6 md:px-8 pb-4 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 -mt-8 sm:-mt-12 md:-mt-16 mb-3 sm:mb-6">
              {/* Avatar */}
              <div className="w-20 sm:w-28 md:w-32 h-20 sm:h-28 md:h-32 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-3xl sm:text-4xl md:text-6xl shadow-lg border-2 sm:border-4 border-white flex-shrink-0">
                {userStats.profileImage ? (
                  <img
                    src={userStats.profileImage}
                    alt={userStats.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{userStats.name.charAt(0)}</span>
                )}
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-right">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800 mb-0.5 sm:mb-1 truncate">
                  {userStats.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 truncate">{userStats.schoolName}</p>
                <span className="inline-block px-2 sm:px-4 py-1 sm:py-2 rounded-full bg-gradient-to-r from-purple-600 to-purple-400 text-white font-bold text-xs sm:text-sm">
                  {stats.rank || 'مساعد مبتدئ'}
                </span>
              </div>

              <button
                onClick={() => setEditMode(!editMode)}
                className="px-3 sm:px-6 py-1.5 sm:py-2 bg-blue-600 text-white rounded-full font-semibold text-xs sm:text-sm hover:bg-blue-700 transition flex-shrink-0"
              >
                {editMode ? '❌' : '✏️'}
              </button>
            </div>

            {editMode ? (
              <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-6 space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm text-gray-700 font-semibold mb-1 sm:mb-2">
                    الاسم
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-2 sm:px-4 py-1.5 sm:py-2 border-2 border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-700 font-semibold mb-1 sm:mb-2">
                    المدرسة
                  </label>
                  <input
                    type="text"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleInputChange}
                    className="w-full px-2 sm:px-4 py-1.5 sm:py-2 border-2 border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-700 font-semibold mb-1 sm:mb-2">
                    السيرة الذاتية
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-2 sm:px-4 py-1.5 sm:py-2 border-2 border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                    placeholder="أخبر الآخرين عن نفسك..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 sm:py-3 rounded-lg font-bold text-xs sm:text-sm hover:shadow-lg transition"
                >
                  💾 حفظ التغييرات
                </button>
              </form>
            ) : (
              <div>
                {userStats.bio && (
                  <p className="text-xs sm:text-sm text-gray-700 italic text-center sm:text-right mb-2 sm:mb-4">
                    "{userStats.bio}"
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-8">
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg p-2 sm:p-4 md:p-6 text-center hover:shadow-lg sm:hover:shadow-xl transition">
            <div className="text-xl sm:text-2xl md:text-4xl font-bold text-purple-600 mb-1 sm:mb-2">
              {stats.points || 0}
            </div>
            <p className="text-xs sm:text-xs md:text-sm text-gray-600 font-semibold">النقاط الإجمالية</p>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-0.5 sm:mt-1">⭐</p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg p-2 sm:p-4 md:p-6 text-center hover:shadow-lg sm:hover:shadow-xl transition">
            <div className="text-xl sm:text-2xl md:text-4xl font-bold text-blue-600 mb-1 sm:mb-2">
              {stats.totalAnswers || 0}
            </div>
            <p className="text-xs sm:text-xs md:text-sm text-gray-600 font-semibold">الإجابات</p>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-0.5 sm:mt-1">📝</p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg p-2 sm:p-4 md:p-6 text-center hover:shadow-lg sm:hover:shadow-xl transition">
            <div className="text-xl sm:text-2xl md:text-4xl font-bold text-green-600 mb-1 sm:mb-2">
              {stats.helpfulAnswers || 0}
            </div>
            <p className="text-xs sm:text-xs md:text-sm text-gray-600 font-semibold">إجابات مفيدة</p>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-0.5 sm:mt-1">💡</p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg p-2 sm:p-4 md:p-6 text-center hover:shadow-lg sm:hover:shadow-xl transition">
            <div className="text-xl sm:text-2xl md:text-4xl font-bold text-orange-600 mb-1 sm:mb-2">
              {stats.badges || 0}
            </div>
            <p className="text-xs sm:text-xs md:text-sm text-gray-600 font-semibold">الشارات</p>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-0.5 sm:mt-1">🎖️</p>
          </div>
        </div>

        {/* Badges Section */}
        {userStats.badges && userStats.badges.length > 0 && (
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg p-3 sm:p-6 md:p-8 mb-4 sm:mb-8">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-6">🏆 شاراتك</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
              {userStats.badges.map((badge, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 text-center border-2 border-yellow-300 hover:shadow-lg transition"
                >
                  <div className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">{badge.icon}</div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 truncate">{badge.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress to Next Rank */}
        {stats.rank && (
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg p-3 sm:p-6 md:p-8">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">📈 تقدمك نحو الترتيب التالي</h2>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <div className="flex justify-between mb-1 sm:mb-2">
                  <span className="text-xs sm:text-sm font-semibold text-gray-700">الترتيب الحالي</span>
                  <span className="text-lg sm:text-2xl font-bold text-purple-600">{stats.rank}</span>
                </div>
              </div>

              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">متطلبات الترتيب:</p>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <div className="flex justify-between mb-1 sm:mb-2">
                      <span className="text-xs sm:text-sm text-gray-700">مساعد مبتدئ</span>
                      <span className="text-xs text-gray-600">0 - 50 نقطة</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                      <div
                        className="bg-blue-500 h-1.5 sm:h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((stats.points / 50) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 sm:mb-2">
                      <span className="text-xs sm:text-sm text-gray-700">مساعد فضي</span>
                      <span className="text-xs text-gray-600">50 - 150 نقطة</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                      <div
                        className="bg-gray-400 h-1.5 sm:h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(((Math.max(stats.points - 50, 0)) / 100) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 sm:mb-2">
                      <span className="text-xs sm:text-sm text-gray-700">مساعد ذهبي</span>
                      <span className="text-xs text-gray-600">150 - 300 نقطة</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                      <div
                        className="bg-yellow-500 h-1.5 sm:h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(((Math.max(stats.points - 150, 0)) / 150) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 sm:mb-2">
                      <span className="text-xs sm:text-sm text-gray-700">مساعد خبير</span>
                      <span className="text-xs text-gray-600">300+ نقطة</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                      <div
                        className="bg-purple-600 h-1.5 sm:h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(((Math.max(stats.points - 300, 0)) / 100) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg sm:rounded-lg p-2 sm:p-4 border-l-4 border-blue-600">
                <p className="text-blue-900 font-semibold text-xs sm:text-sm">
                  💡 {stats.points < 50
                    ? `تحتاج إلى ${50 - stats.points} نقطة أخرى للوصول إلى مساعد فضي`
                    : stats.points < 150
                    ? `تحتاج إلى ${150 - stats.points} نقطة أخرى للوصول إلى مساعد ذهبي`
                    : stats.points < 300
                    ? `تحتاج إلى ${300 - stats.points} نقطة أخرى للوصول إلى مساعد خبير`
                    : 'أنت قد وصلت إلى أعلى ترتيب! 🎉'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
