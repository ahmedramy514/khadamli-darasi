import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [attachment, setAttachment] = useState(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const { user, token } = useContext(AuthContext);
  const selectedConversationRef = useRef(selectedConversation);
  const messagesEndRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [messagesRes] = await Promise.all([
        axios.get('/messages'),
      ]);
      setMessages(messagesRes.data);

      // Group messages by conversation
      const convos = {};
      messagesRes.data.forEach((msg) => {
        const otherId = msg.sender._id === user.id ? msg.recipient._id : msg.sender._id;
        const otherUser = msg.sender._id === user.id ? msg.recipient : msg.sender;
        if (!convos[otherId]) {
          convos[otherId] = {
            userId: otherId,
            userName: otherUser.name,
            lastMessage: msg.content,
            lastMessageTime: msg.createdAt,
            unreadCount: msg.recipient._id === user.id && !msg.isRead ? 1 : 0,
          };
        } else if (msg.recipient._id === user.id && !msg.isRead) {
          convos[otherId].unreadCount += 1;
        }
      });

      setConversations(Object.values(convos).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)));
      setLoading(false);
    } catch (err) {
      console.error('خطأ في جلب البيانات:', err);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchData();

    // init socket connection for real-time
    try {
      const base = (process.env.REACT_APP_API_URL || axios.defaults.baseURL).replace(/\/api\/?$/, '');
      const socket = io(base, {
        transports: ['websocket'],
        auth: {
          token: token || null,
        },
      });
      socketRef.current = socket;
      socket.on('connect', () => {
        if (user && user.id) socket.emit('join', user.id);
      });

      socket.on('new_message', (msg) => {
        const sel = selectedConversationRef.current;
        if (sel && (String(msg.sender._id) === String(sel) || String(msg.recipient._id) === String(sel))) {
          setMessages((prev) => [...prev, msg]);
        }
        fetchData();
      });

      socket.on('notification', (notif) => {
        fetchData();
      });

      socket.on('typing', ({ from }) => {
        if (String(from) === String(selectedConversationRef.current)) {
          // Typing indicator logic removed for build optimization
        }
      });

      return () => {
        try { socket.disconnect(); } catch (e) {}
      };
    } catch (e) {
      console.warn('Socket init failed', e.message);
    }
  }, [user, token, fetchData]);

  const handleSelectConversation = async (userId) => {
    setSelectedConversation(userId);
    selectedConversationRef.current = userId;
    try {
      const res = await axios.get(`/messages/conversation/${userId}`);
      setMessages(res.data);
      // Mark all messages as read
      res.data.forEach((msg) => {
        if (msg.recipient._id === user.id && !msg.isRead) {
          axios.patch(`/messages/${msg._id}/read`).catch(err => console.error(err));
        }
      });
    } catch (err) {
      console.error('خطأ في جلب المحادثة:', err);
    }
  };

  // Debounced search for users by query
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const t = setTimeout(async () => {
      try {
        const res = await axios.get(`/users?q=${encodeURIComponent(searchQuery.trim())}`);
        // exclude self
        setSearchResults(res.data.filter(u => u._id !== user.id));
      } catch (e) {
        console.error('Search users failed', e.message);
      }
    }, 350);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      try {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      } catch (e) {}
    }
  }, [messages]);

  // update ref when selectedConversation changes
  useEffect(() => { selectedConversationRef.current = selectedConversation; }, [selectedConversation]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !attachment) return;

    try {
      const recipientId = selectedConversation || selectedRecipient;
      if (!recipientId) {
        alert('اختر مستقبل الرسالة');
        return;
      }

      const form = new FormData();
      form.append('recipientId', recipientId);
      form.append('content', newMessage || '');
      if (attachment) form.append('attachment', attachment);

      await axios.post('/messages', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // emit typing stopped / message sent event to recipient via socket
      try {
        const sock = socketRef.current;
        if (sock && recipientId) sock.emit('message_sent', { to: recipientId });
      } catch (e) {}

      setNewMessage('');
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = null;

      setShowNewConversation(false);
      fetchData();
      setSelectedConversation(recipientId);
    } catch (err) {
      alert('خطأ في إرسال الرسالة: ' + (err.response?.data?.message || err.message));
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 pb-28 pt-20">
      <div className="flex h-screen bg-gray-100">
        {/* الجانب الأيسر: قائمة المحادثات */}
        <div className="w-full md:w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 sticky top-0 bg-white">
            <h2 className="text-xl font-bold text-gray-800 mb-3">💬 الرسائل</h2>
            <button
              onClick={() => setShowNewConversation(true)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
            >
              ➕ رسالة جديدة
            </button>
          </div>

          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>لا توجد رسائل</p>
            </div>
          ) : (
            <div>
              {conversations.map((convo) => (
                <div
                  key={convo.userId}
                  onClick={() => handleSelectConversation(convo.userId)}
                  className={`p-3 border-b border-gray-100 cursor-pointer transition ${
                    selectedConversation === convo.userId ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{convo.userName}</h3>
                      <p className="text-xs text-gray-600 truncate">{convo.lastMessage}</p>
                    </div>
                    {convo.unreadCount > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* الجانب الأيمن: محتوى المحادثة */}
        {selectedConversation ? (
          <div className="flex md:w-2/3 flex-col bg-white w-full md:relative fixed inset-0 z-50">
            {/* رأس المحادثة */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center gap-3">
              {/* زر الرجوع للموبايل */}
              <button 
                onClick={() => setSelectedConversation(null)}
                className="md:hidden text-white p-2 hover:bg-white/20 rounded-lg"
              >
                ←
              </button>
              <h2 className="text-xl font-bold flex-1">
                {conversations.find((c) => c.userId === selectedConversation)?.userName || 'محادثة'}
              </h2>
            </div>

            {/* قائمة الرسائل */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.sender._id === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      msg.sender._id === user.id
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {msg.attachment && (
                      <div className="mb-2">
                        {(() => {
                          const uploadsBase = (process.env.REACT_APP_API_URL || axios.defaults.baseURL).replace(/\/api\/?$/, '');
                          const url = `${uploadsBase}${msg.attachment}`;
                          const lower = (msg.attachment || '').toLowerCase();
                          if (lower.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
                            return <img src={url} alt="attachment" className="max-w-full rounded-md" />;
                          }
                          if (lower.match(/\.(mp4|webm|ogg)$/)) {
                            return (
                              <video controls className="max-w-full rounded-md">
                                <source src={url} />
                                متصفحك لا يدعم تشغيل الفيديو
                              </video>
                            );
                          }
                          return (
                            <a href={url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">
                              تنزيل المرفق
                            </a>
                          );
                        })()}
                      </div>
                    )}
                    <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs mt-1 opacity-75">
                      {new Date(msg.createdAt).toLocaleTimeString('ar-SA')}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* صندوق الإدخال */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-2 items-center">
                <label className="cursor-pointer p-2 bg-white border rounded-lg">
                  📎
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*,audio/*,application/*"
                    onChange={(e) => setAttachment(e.target.files && e.target.files[0])}
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="اكتب رسالتك هنا..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  ارسل
                </button>
              </div>
              {attachment && (
                <div className="mt-2 text-sm text-gray-700">مرفق: {attachment.name}</div>
              )}
            </div>
          </div>
        ) : (
          <div className="hidden md:flex md:w-2/3 flex-col items-center justify-center bg-gray-50">
            <p className="text-gray-500 text-lg">اختر محادثة لعرضها</p>
          </div>
        )}

        {/* Modal: رسالة جديدة */}
        {showNewConversation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold mb-4">رسالة جديدة</h3>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="اكتب اسم المستخدم للبحث..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:border-blue-500"
                />
                <div className="max-h-48 overflow-y-auto mb-3">
                  {searchResults.length === 0 ? (
                    <div className="text-xs text-gray-500">اكتب على الأقل حرفين للبحث</div>
                  ) : (
                    searchResults.map(u => (
                      <div key={u._id} className={`p-2 hover:bg-gray-100 rounded cursor-pointer ${selectedRecipient === u._id ? 'bg-blue-50' : ''}`} onClick={() => setSelectedRecipient(u._id)}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-sm">{u.name}</div>
                            <div className="text-xs text-gray-500">{u.email}</div>
                          </div>
                          <div className="text-xs text-gray-400">{u.role}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="اكتب رسالتك..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:border-blue-500 resize-none"
                  rows={4}
                />

                <div className="flex items-center gap-2 mb-3">
                  <label className="cursor-pointer p-2 bg-white border rounded-lg">
                    📎
                    <input
                      type="file"
                      accept="image/*,video/*,audio/*,application/*"
                      onChange={(e) => setAttachment(e.target.files && e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  {attachment && <div className="text-sm text-gray-700">مرفق: {attachment.name}</div>}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSendMessage}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    إرسال
                  </button>
                  <button
                    onClick={() => {
                      setShowNewConversation(false);
                      setSelectedRecipient('');
                      setNewMessage('');
                      setSearchQuery('');
                      setSearchResults([]);
                      setAttachment(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
