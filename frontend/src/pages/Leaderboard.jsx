import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Leaderboard = () => {
  const { user, token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' or 'allTime'
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchLeaderboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, token]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      if (activeTab === 'weekly') {
        const res = await axios.get('/users/weekly-top');
        setLeaderboard(res.data);
      } else {
        const res = await axios.get('/users/leaderboard');
        setLeaderboard(res.data.allTime);
      }
    } catch (err) {
      console.error('خطأ في جلب الترتيب:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank) => {
    const colors = {
      'مساعد خبير': 'from-purple-600 to-purple-400',
      'مساعد ذهبي': 'from-yellow-500 to-yellow-300',
      'مساعد فضي': 'from-gray-400 to-gray-300',
      'مساعد مبتدئ': 'from-blue-500 to-blue-300',
    };
    return colors[rank] || 'from-blue-500 to-blue-300';
  };

  const getMedalEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-28 pt-20">
      <div className="w-full max-w-5xl mx-auto px-2 sm:px-4">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">
            🏆 لوحة الشرف
          </h1>
          <p className="text-xs sm:text-sm md:text-lg text-gray-600">أفضل المساعدين والمتميزين</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-xs sm:text-sm transition-all ${
              activeTab === 'weekly'
                ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-400'
            }`}
          >
            📅 هذا الأسبوع
          </button>
          <button
            onClick={() => setActiveTab('allTime')}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-xs sm:text-sm transition-all ${
              activeTab === 'allTime'
                ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-400'
            }`}
          >
            ⭐ جميع الأوقات
          </button>
        </div>

        {/* Leaderboard List */}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin text-3xl sm:text-4xl">⏳</div>
            <p className="text-xs sm:text-base text-gray-600 mt-2 sm:mt-4">جاري التحميل...</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-4">
            {leaderboard.map((helper, index) => {
              const isCurrentUser = user && user.id === helper._id;
              return (
                <div
                  key={helper._id}
                  className={`bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transition-all overflow-hidden border-l-4 ${
                    isCurrentUser
                      ? 'border-l-purple-600 bg-gradient-to-r from-purple-50 to-transparent'
                      : 'border-l-gray-300'
                  }`}
                >
                  <div className="p-2 sm:p-4 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    {/* Position and Name */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="text-2xl sm:text-3xl font-bold text-center flex-shrink-0 w-8 sm:w-12">
                        {getMedalEmoji(index)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                          <h3 className="font-bold text-sm sm:text-base md:text-lg text-gray-800 truncate">
                            {helper.name}
                            {isCurrentUser && <span className="text-xs sm:text-sm ml-1 sm:ml-2 flex-shrink-0">👈 أنت</span>}
                          </h3>
                          <span
                            className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-white text-xs font-bold bg-gradient-to-r flex-shrink-0 ${getRankColor(
                              helper.rank
                            )}`}
                          >
                            {helper.rank}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                          <span className="flex-shrink-0">📝 {helper.totalAnswers}</span>
                          <span className="flex-shrink-0">💡 {helper.helpfulAnswers}</span>
                        </div>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center justify-end gap-1 sm:gap-2 mb-1 sm:mb-2">
                        <span className="text-lg sm:text-2xl font-bold text-purple-600">
                          {activeTab === 'weekly'
                            ? helper.weeklyPoints
                            : helper.points}
                        </span>
                        <span className="text-lg sm:text-2xl">⭐</span>
                      </div>
                      {helper.badges && helper.badges.length > 0 && (
                        <div className="flex gap-0.5 sm:gap-1 justify-end">
                          {helper.badges.slice(0, 3).map((badge, idx) => (
                            <span key={idx} title={badge.name} className="text-sm sm:text-lg">
                              {badge.icon}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {leaderboard.length === 0 && (
              <div className="text-center py-8 sm:py-12 bg-white rounded-xl sm:rounded-2xl">
                <p className="text-xs sm:text-base md:text-lg text-gray-600">لا توجد بيانات حالياً 😕</p>
              </div>
            )}
          </div>
        )}

        {/* Current User Stats Card */}
        {user && (
          <div className="mt-6 sm:mt-8 md:mt-12 bg-gradient-to-r from-purple-600 to-purple-400 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg p-4 sm:p-6 md:p-8 text-white">
            <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4">📊 إحصائياتك الشخصية</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              <div className="bg-white/20 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 backdrop-blur">
                <p className="text-purple-100 text-xs sm:text-xs md:text-sm">النقاط الإجمالية</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">{user.points || 0}</p>
              </div>
              <div className="bg-white/20 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 backdrop-blur">
                <p className="text-purple-100 text-xs sm:text-xs md:text-sm">الترتيب</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold line-clamp-2">{user.rank}</p>
              </div>
              <div className="bg-white/20 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 backdrop-blur">
                <p className="text-purple-100 text-xs sm:text-xs md:text-sm">الإجابات</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">{user.totalAnswers || 0}</p>
              </div>
              <div className="bg-white/20 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 backdrop-blur">
                <p className="text-purple-100 text-xs sm:text-xs md:text-sm">الإجابات المفيدة</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">{user.helpfulAnswers || 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
