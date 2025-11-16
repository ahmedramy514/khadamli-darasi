import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('/users/leaderboard');
      setLeaderboard(response.data);
      setShowLeaderboard(true);
    } catch (err) {
      console.error('خطأ في جلب الترتيب:', err);
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 'متفوق':
        return 'text-yellow-600';
      case 'نشيط':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 pb-28 pt-20">
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold truncate">{user?.name}</h1>
              <p className="text-xs sm:text-sm text-blue-100 mt-1 sm:mt-2 truncate">{user?.email}</p>
              {user?.schoolName && (
                <p className="text-xs sm:text-sm text-blue-100 mt-0.5 sm:mt-1 truncate">🏫 {user.schoolName}</p>
              )}
            </div>
            <div className="text-center flex-shrink-0">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold">{user?.points || 0}</div>
              <p className="text-xs sm:text-sm text-blue-100">نقاط</p>
            </div>
          </div>
          <div className="mt-4 sm:mt-6 bg-blue-700 bg-opacity-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-blue-100">الترتيب</p>
            <p className={`text-lg sm:text-2xl font-bold mt-1 ${getRankColor(user?.rank)}`}>
              {user?.rank || 'مبتدئ'}
            </p>
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3 md:space-y-4">
          <button
            onClick={fetchLeaderboard}
            className="w-full bg-white border-2 border-blue-500 text-blue-600 font-semibold py-2 sm:py-3 rounded-lg hover:bg-blue-50 transition text-xs sm:text-sm"
          >
            🏅 عرض لوحة الشرف
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white font-semibold py-2 sm:py-3 rounded-lg hover:bg-red-600 transition text-xs sm:text-sm"
          >
            تسجيل الخروج
          </button>
        </div>

        {showLeaderboard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg sm:rounded-2xl w-full max-w-md max-h-96 sm:max-h-96 overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-blue-600 text-white p-3 sm:p-6 flex justify-between items-center">
                <h3 className="text-lg sm:text-2xl font-bold">🏅 لوحة الشرف</h3>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="text-lg sm:text-2xl font-bold cursor-pointer hover:text-blue-100"
                >
                  ✕
                </button>
              </div>
              <div className="p-2 sm:p-4 space-y-2 sm:space-y-3">
                {leaderboard.map((player, index) => (
                  <div
                    key={player._id}
                    className="flex items-center justify-between bg-gray-50 p-2 sm:p-4 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <span className="font-bold text-sm sm:text-lg text-blue-600 flex-shrink-0">
                        #{index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs sm:text-sm text-gray-800 truncate">
                          {player.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{player.rank}</p>
                      </div>
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-blue-600 flex-shrink-0">
                      {player.points} 🪙
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
