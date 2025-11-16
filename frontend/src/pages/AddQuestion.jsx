import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AddQuestion = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [classroomId, setClassroomId] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const { token } = useContext(AuthContext);

  React.useEffect(() => {
    fetchClassrooms();
  }, [token]);

  const fetchClassrooms = async () => {
    try {
      const response = await axios.get('/classrooms');
      setClassrooms(response.data);
    } catch (err) {
      console.error('خطأ في جلب الفصول:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      alert('الرجاء ملء عنوان وتفاصيل السؤال');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (subject) formData.append('subject', subject);
      if (classroomId) formData.append('classroomId', classroomId);
      if (attachment) formData.append('attachment', attachment);

      await axios.post('/questions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('✅ تم رفع السؤال بنجاح!');
      setTitle('');
      setDescription('');
      setSubject('');
      setAttachment(null);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert('خطأ: ' + (err.response?.data?.message || 'حدث خطأ'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 pb-28 pt-20">
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">📝 رفع سؤال جديد</h1>

        {success && (
          <div className="bg-green-100 text-green-700 p-2 sm:p-3 md:p-4 rounded-lg mb-3 sm:mb-4 text-xs sm:text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg p-3 sm:p-6 md:p-8 space-y-3 sm:space-y-4 md:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm md:text-base text-gray-700 font-semibold mb-1 sm:mb-2">
              اختر الفصل
            </label>
            <select
              value={classroomId}
              onChange={(e) => setClassroomId(e.target.value)}
              className="w-full px-2 sm:px-4 py-1.5 sm:py-2 md:py-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm md:text-base focus:outline-none focus:border-blue-500"
            >
              <option value="">-- اختر فصل --</option>
              {classrooms.map((classroom) => (
                <option key={classroom._id} value={classroom._id}>
                  {classroom.name} - {classroom.subject}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm md:text-base text-gray-700 font-semibold mb-1 sm:mb-2">
              عنوان السؤال
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-2 sm:px-4 py-1.5 sm:py-2 md:py-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm md:text-base focus:outline-none focus:border-blue-500"
              placeholder="ما هو سؤالك؟"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm md:text-base text-gray-700 font-semibold mb-1 sm:mb-2">
              تفاصيل السؤال
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-2 sm:px-4 py-1.5 sm:py-2 md:py-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm md:text-base focus:outline-none focus:border-blue-500 resize-none"
              rows="4"
              placeholder="اشرح سؤالك بالتفصيل..."
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm md:text-base text-gray-700 font-semibold mb-1 sm:mb-2">
              المادة (اختياري)
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-2 sm:px-4 py-1.5 sm:py-2 md:py-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm md:text-base focus:outline-none focus:border-blue-500"
              placeholder="مثال: الرياضيات"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm md:text-base text-gray-700 font-semibold mb-1 sm:mb-2">
              إرفاق صورة أو ملف PDF (اختياري)
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setAttachment(e.target.files[0])}
              className="w-full px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-xs sm:text-sm md:text-base"
          >
            {loading ? '⏳ جاري الرفع...' : '📤 رفع السؤال'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddQuestion;
