import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Badges = () => {
  const { user } = useContext(AuthContext);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBadges();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/users/${user.id}/badges`);
      setUserBadges(res.data.badges || []);
    } catch (err) {
      console.error('خطأ في جلب الشارات:', err);
    } finally {
      setLoading(false);
    }
  };

  // جميع الشارات المتاحة
  const allAvailableBadges = [
    {
      name: 'أول إجابة',
      description: 'قدمت إجابتك الأولى! 🎉',
      icon: '🎖️',
      requirement: 'إجابة واحدة',
    },
    {
      name: 'المساعد النشيط',
      description: 'قدمت 10 إجابات! 💪',
      icon: '⭐',
      requirement: '10 إجابات',
    },
    {
      name: 'المساعد الموثوق',
      description: 'قدمت 50 إجابة! 🏆',
      icon: '👑',
      requirement: '50 إجابة',
    },
    {
      name: 'الإجابات المفيدة',
      description: 'ساعدت 5 أشخاص بإجابات مفيدة! 🌟',
      icon: '💡',
      requirement: '5 إجابات مفيدة',
    },
    {
      name: 'السفير المساعد',
      description: 'ساعدت 20 شخص بإجابات مفيدة! 🚀',
      icon: '🌍',
      requirement: '20 إجابة مفيدة',
    },
  ];

  const isEarned = (badgeName) => {
    return userBadges.some(b => b.name === badgeName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-28 pt-20">
      <div className="w-full max-w-5xl mx-auto px-2 sm:px-4">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">
            🎖️ الشارات والجوائز
          </h1>
          <p className="text-xs sm:text-sm md:text-lg text-gray-600">
            اجمع شارات جديدة بساعدتك لزملائك
          </p>
        </div>

        {/* Badges Grid */}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin text-3xl sm:text-4xl">⏳</div>
            <p className="text-xs sm:text-base text-gray-600 mt-2 sm:mt-4">جاري التحميل...</p>
          </div>
        ) : (
          <>
            {/* Earned Badges */}
            {userBadges.length > 0 && (
              <div className="mb-8 sm:mb-12">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
                  ✨ شاراتك المكتسبة
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                  {userBadges.map((badge, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg p-4 sm:p-6 md:p-8 border-2 border-yellow-300 text-center transform hover:scale-105 transition-transform"
                    >
                      <div className="text-4xl sm:text-5xl md:text-6xl mb-2 sm:mb-4">{badge.icon}</div>
                      <h3 className="text-sm sm:text-lg md:text-xl font-bold text-gray-800 mb-1 sm:mb-2">
                        {badge.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4">
                        {badge.description}
                      </p>
                      <p className="text-xs text-yellow-600 font-semibold">
                        🎉 تم: {new Date(badge.earnedAt).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Available Badges */}
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
                🎯 جميع الشارات المتاحة
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                {allAvailableBadges.map((badge, index) => {
                  const earned = isEarned(badge.name);
                  return (
                    <div
                      key={index}
                      className={`rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg p-4 sm:p-6 md:p-8 text-center transition-all ${
                        earned
                          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 transform scale-100'
                          : 'bg-white border-2 border-gray-200 opacity-75 transform scale-95 hover:scale-100'
                      }`}
                    >
                      <div className={`text-4xl sm:text-5xl md:text-6xl mb-2 sm:mb-4 ${earned ? '' : 'grayscale opacity-50'}`}>
                        {badge.icon}
                      </div>
                      <h3
                        className={`text-sm sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 ${
                          earned ? 'text-gray-800' : 'text-gray-600'
                        }`}
                      >
                        {badge.name}
                      </h3>
                      <p
                        className={`text-xs sm:text-sm mb-3 sm:mb-4 ${
                          earned ? 'text-gray-700' : 'text-gray-500'
                        }`}
                      >
                        {badge.description}
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-xs font-bold ${
                            earned
                              ? 'bg-yellow-200 text-yellow-800'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {badge.requirement}
                        </span>
                      </div>
                      {earned && (
                        <div className="mt-2 sm:mt-4 text-green-600 font-bold text-sm sm:text-lg">
                          ✓ مكتسبة
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tips Section */}
            <div className="mt-8 sm:mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg p-4 sm:p-6 md:p-8 text-white">
              <h3 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4">💡 نصائح لكسب المزيد من الشارات</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-lg sm:text-2xl flex-shrink-0">📝</span>
                  <div>
                    <p className="font-semibold text-sm sm:text-base">أجب على الأسئلة</p>
                    <p className="text-xs sm:text-sm text-blue-100">كلما زاد عدد إجاباتك، كسبت نقاط وشارات جديدة</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-lg sm:text-2xl flex-shrink-0">👍</span>
                  <div>
                    <p className="font-semibold text-sm sm:text-base">قدم إجابات مفيدة</p>
                    <p className="text-xs sm:text-sm text-blue-100">عندما يقيم الآخرون إجابتك كمفيدة، تكسب نقاطاً إضافية</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-lg sm:text-2xl flex-shrink-0">⭐</span>
                  <div>
                    <p className="font-semibold text-sm sm:text-base">اصعد الترتيب</p>
                    <p className="text-xs sm:text-sm text-blue-100">من مساعد مبتدئ إلى خبير، كل ترتيب يحتاج نقاط أكثر</p>
                  </div>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Badges;
