import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, setUser, setToken } = useContext(AuthContext);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [serverOnline, setServerOnline] = useState(true);
  const pollRef = useRef(null);

  useEffect(() => {
    // start polling only when user is present
    if (!user) return;

    let failed = 0;
    const attempt = async () => {
      try {
        await fetchNotifications();
        failed = 0;
        setServerOnline(true);
      } catch (err) {
        failed += 1;
        // if persistent network error, mark server offline and back off
        if (failed >= 3) {
          setServerOnline(false);
          // stop polling temporarily
          if (pollRef.current) clearInterval(pollRef.current);
          // retry after 10s
          pollRef.current = setInterval(() => {
            attempt();
          }, 10000);
        }
      }
    };

    // initial call and normal polling
    attempt();
    pollRef.current = setInterval(attempt, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/notifications');
      setNotifications(res.data);
      const unread = res.data.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
      return res.data;
    } catch (err) {
      // avoid spamming console on repeated network errors
      if (err?.message && err.message.includes('Network Error')) {
        console.warn('Backend unreachable (notifications).');
      } else {
        console.error('خطأ في جلب الاشعارات:', err);
      }
      throw err;
    }
  };

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      await axios.patch(`/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('خطأ في تحديث الاشعار:', err);
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      await axios.post('/notifications/mark-all-read');
      fetchNotifications();
    } catch (err) {
      console.error('خطأ:', err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-6xl bg-gradient-to-r from-white/60 via-white/30 to-white/60 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl py-1.5 sm:py-2 px-2 sm:px-4 flex items-center justify-between gap-2 sm:gap-4 transition-all duration-300">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 sm:w-11 h-9 sm:h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400 flex items-center justify-center text-white text-xl sm:text-2xl drop-shadow-md transform transition-all duration-500 hover:scale-105">
            {/* professional SVG logo */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <defs>
                <linearGradient id="g1" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="50%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#g1)" opacity="0.14" />
              <path d="M7 12c1.5-2 4-3 6-3s4.5 1 6 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="9" r="1.6" fill="white" opacity="0.95" />
              <circle cx="15" cy="15" r="1.6" fill="white" opacity="0.95" />
            </svg>
          </div>
          {/* server status indicator */}
          {!serverOnline && (
            <div className="text-xs text-red-600 font-semibold">خادم معطّل</div>
          )}
          <div className="hidden md:flex flex-col leading-none">
            <span className="font-extrabold text-gray-800 text-sm">خدملي دراسي</span>
            <span className="text-xs text-gray-500 -mt-0.5">منصة تعليمية</span>
          </div>
        </div>

        {/* Center: Compact search (hidden on small screens) */}
        <div className="hidden md:flex flex-1 items-center justify-center px-2 sm:px-4">
          <div className="w-full max-w-xl bg-white/60 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1 flex items-center gap-3 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 sm:h-5 w-4 sm:w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z" />
            </svg>
            <input className="w-full bg-transparent outline-none text-xs sm:text-sm text-gray-700" placeholder="ابحث عن فصل، سؤال، أو طالب..." />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-3">
          <button onClick={() => navigate('/add-question')} className="inline-flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-2 sm:px-3 py-1.5 rounded-lg shadow hover:scale-[1.02] transform transition text-xs sm:text-sm" aria-label="سؤال جديد">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 sm:h-5 w-4 sm:w-5" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">سؤال جديد</span>
            <span className="sm:hidden">سؤال</span>
          </button>

          <button onClick={() => navigate('/messages')} className="inline-flex items-center gap-1 sm:gap-2 bg-white/40 hover:bg-white/60 text-gray-700 px-2 sm:px-3 py-1.5 rounded-lg shadow transition text-xs sm:text-sm" aria-label="الرسائل">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 sm:h-5 w-4 sm:w-5" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">رسائل</span>
            <span className="sm:hidden">راسل</span>
          </button>

          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-1.5 sm:p-2 rounded-lg hover:bg-white/40 transition text-lg flex items-center" aria-label="الاشعارات">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 sm:h-5 w-4 sm:w-5 text-gray-700" viewBox="0 0 24 24" fill="none">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {unreadCount > 0 && (
                <span className="absolute -inset-1 rounded-lg border border-red-300 opacity-30 animate-ping" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-96 max-w-xs bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between border-b">
                  <strong className="text-sm">الاشعارات</strong>
                  <button onClick={handleMarkAllNotificationsAsRead} className="text-xs text-sky-600">اعتبر الكل كمقروء</button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">لا توجد اشعارات</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n._id} onClick={() => handleMarkNotificationAsRead(n._id)} className={`p-3 hover:bg-gray-50 flex items-start gap-3 ${n.isRead ? '' : 'bg-sky-50'}`}>
                        <div className="w-2 h-2 rounded-full mt-1 bg-sky-500" />
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-gray-800">{n.title}</div>
                          <div className="text-[12px] text-gray-500 mt-1">{n.description}</div>
                          <div className="text-[11px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center text-white font-bold shadow-lg hover:scale-105 transition" aria-label="قائمة الحساب">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 sm:h-5 w-4 sm:w-5" viewBox="0 0 24 24" fill="none">
                <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM3 21a9 9 0 0 1 18 0" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-44 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b">
                  <div className="font-semibold text-sm">{user?.name}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                <button onClick={() => { navigate('/user-profile'); setShowProfileMenu(false); }} className="w-full text-right px-4 py-2 hover:bg-gray-50">حسابي</button>
                <button onClick={() => { navigate('/badges'); setShowProfileMenu(false); }} className="w-full text-right px-4 py-2 hover:bg-gray-50">الشارات</button>
                <button onClick={() => { handleLogout(); setShowProfileMenu(false); }} className="w-full text-right px-4 py-2 text-red-600 hover:bg-gray-50">خروج</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav (minimal, futuristic) */}
      <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 md:hidden z-40 w-11/12 max-w-md bg-white/60 backdrop-blur rounded-full py-2 px-3 shadow-lg flex justify-between items-center">
        <button onClick={() => navigate('/')} className="flex flex-col items-center text-xs text-gray-700" aria-label="الرئيسية">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="mt-0.5">الرئيسية</span>
        </button>

        <button onClick={() => navigate('/questions')} className="flex flex-col items-center text-xs text-gray-700" aria-label="الأسئلة">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none">
            <path d="M12 20h9" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 2v18" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="6" cy="8" r="1" fill="#374151" />
          </svg>
          <span className="mt-0.5">الأسئلة</span>
        </button>

        <button onClick={() => navigate('/assignments')} className="flex flex-col items-center text-xs text-gray-700" aria-label="الواجبات">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 1 0 2-2 2 2 0 0 0-2 2" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 12h6M9 16h6" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="mt-0.5">واجبات</span>
        </button>

        <button onClick={() => navigate('/badges')} className="flex flex-col items-center text-xs text-gray-700" aria-label="الشارات">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none">
            <path d="M12 2v8m0 0l-3-3m3 3l3-3M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0z" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="mt-0.5">شارات</span>
        </button>

        <button onClick={() => navigate('/user-profile')} className="flex flex-col items-center text-xs text-gray-700" aria-label="حسابي">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none">
            <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM3 21a9 9 0 0 1 18 0" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="mt-0.5">حسابي</span>
        </button>
      </nav>
    </>
  );
};

export default Navbar;
