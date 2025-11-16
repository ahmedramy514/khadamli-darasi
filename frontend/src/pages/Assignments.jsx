import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    classroomId: '',
    deadline: '',
    attachment: null,
  });
  const { user } = useContext(AuthContext);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [showStudentSubmitModal, setShowStudentSubmitModal] = useState(false);
  const [studentSubmissionContent, setStudentSubmissionContent] = useState('');
  const [studentSubmissionFile, setStudentSubmissionFile] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [_unused1, _unused2] = [showSubmissionsModal, submissions]; // silence eslint unused vars

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignRes, classRes] = await Promise.all([
        axios.get('/assignments'),
        axios.get('/classrooms'),
      ]);
      setAssignments(assignRes.data);
      setClassrooms(classRes.data);
      setLoading(false);
    } catch (err) {
      console.error('خطأ في جلب البيانات:', err);
      setLoading(false);
    }
  };

  const getAssignmentStatus = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const daysLeft = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { status: 'expired', text: 'انتهت المدة', color: 'red' };
    if (daysLeft === 0) return { status: 'today', text: 'اليوم', color: 'orange' };
    if (daysLeft <= 3) return { status: 'urgent', text: `${daysLeft} أيام`, color: 'amber' };
    return { status: 'normal', text: `${daysLeft} أيام`, color: 'green' };
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', newAssignment.title);
      formData.append('description', newAssignment.description);
      formData.append('classroomId', newAssignment.classroomId);
      formData.append('deadline', newAssignment.deadline);
      if (newAssignment.attachment) {
        formData.append('attachment', newAssignment.attachment);
      }

      await axios.post('/assignments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setNewAssignment({
        title: '',
        description: '',
        classroomId: '',
        deadline: '',
        attachment: null,
      });
      setShowCreateModal(false);
      fetchData();
    } catch (err) {
      console.error('خطأ في إنشاء الواجب:', err);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'pending') {
      const status = getAssignmentStatus(a.deadline).status;
      return status !== 'expired';
    }
    if (selectedFilter === 'expired') {
      return getAssignmentStatus(a.deadline).status === 'expired';
    }
    return true;
  });

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
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-8">
        {/* الرأس */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">
                📋 الواجبات والمهام
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">إدارة واجباتك وملفاتك بكل سهولة</p>
            </div>
            {user?.role === 'teacher' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-xs sm:text-sm"
              >
                <span>➕</span>
                <span>واجب جديد</span>
              </button>
            )}
          </div>
        </div>

        {/* التصفية */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
          {[
            { id: 'all', label: '📌 الكل', icon: '📌' },
            { id: 'pending', label: '⏳ قيد الانتظار', icon: '⏳' },
            { id: 'expired', label: '❌ منتهى', icon: '❌' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition ${
                selectedFilter === filter.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* قائمة الواجبات */}
        {filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg p-6 sm:p-8 text-center">
            <p className="text-lg sm:text-xl text-gray-600">📭 لا توجد واجبات</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredAssignments.map((assignment) => {
              const statusInfo = getAssignmentStatus(assignment.deadline);
              // assignment.classroom may be id string or ObjectId
              const classroomId = assignment.classroom || assignment.classroomId;
              const classroom = classrooms.find((c) => c._id === classroomId);
              return (
                <div
                  key={assignment._id}
                  className="bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition border-l-4 border-blue-500 p-3 sm:p-4 md:p-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-1 truncate">
                        {assignment.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">
                        {classroom?.name && `📚 ${classroom.name}`}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full font-bold text-xs sm:text-sm text-white flex-shrink-0" style={{backgroundColor: statusInfo.color === 'red' ? '#ef4444' : statusInfo.color === 'orange' ? '#f59e0b' : statusInfo.color === 'amber' ? '#f59e0b' : '#10b981'}}>
                      {statusInfo.text}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-700 mb-3 line-clamp-2">
                    {assignment.description}
                  </p>

                  <div className="flex flex-wrap gap-2 sm:gap-4 items-center text-xs sm:text-sm text-gray-500 pb-3 sm:pb-4 border-b border-gray-200">
                    <span>📅 {new Date(assignment.deadline).toLocaleDateString('ar-SA')}</span>
                    {assignment.attachments && assignment.attachments.length > 0 && <span>📎 يوجد ملف مرفق</span>}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4">
                    <button onClick={async () => {
                      // open assignment detail for student or teacher
                      setActiveAssignment(assignment);
                      // if student, fetch their submission status
                      if (user?.role === 'student') {
                        try {
                          // eslint-disable-next-line no-unused-vars
                          const res = await axios.get(`/assignments`);
                          // nothing extra needed, assignment object contains submissions only when teacher requests; student submission is in assignment.submissions if present
                        } catch (err) {
                          console.error(err);
                        }
                      }
                      // show a modal by reusing submissions modal for teachers, or detail modal for students
                      if (user?.role === 'teacher') {
                        try {
                          const res = await axios.get(`/assignments/${assignment._id}/submissions`);
                          setSubmissions(res.data.submissions || []);
                          setShowSubmissionsModal(true);
                        } catch (err) {
                          alert('خطأ في جلب التقديمات: ' + (err.response?.data?.message || err.message));
                        }
                      } else {
                        // student: open a small submit modal
                        setShowStudentSubmitModal(true);
                      }
                    }} className="flex-1 bg-blue-600 text-white py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-xs sm:text-sm">
                      🔗 فتح الواجب
                    </button>
                    {user?.role === 'teacher' && (
                      <button onClick={async () => {
                        try {
                          setActiveAssignment(assignment);
                          const res = await axios.get(`/assignments/${assignment._id}/submissions`);
                          setSubmissions(res.data.submissions || []);
                          setShowSubmissionsModal(true);
                        } catch (err) {
                          alert('خطأ في جلب التقديمات: ' + (err.response?.data?.message || err.message));
                        }
                      }} className="flex-1 bg-indigo-600 text-white py-1.5 sm:py-2 rounded-lg hover:bg-indigo-700 transition font-semibold text-xs sm:text-sm">
                        👀 عرض التقديمات
                      </button>
                    )}
                    {assignment.attachment && (
                      <button className="flex-1 bg-green-600 text-white py-1.5 sm:py-2 rounded-lg hover:bg-green-700 transition font-semibold text-xs sm:text-sm">
                        📥 تحميل الملف
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* حوار إنشاء واجب جديد */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg sm:text-2xl font-bold mb-4">إنشاء واجب جديد</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2">الفصل</label>
                <select
                  value={newAssignment.classroomId}
                  onChange={(e) =>
                    setNewAssignment({ ...newAssignment, classroomId: e.target.value })
                  }
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- اختر فصل --</option>
                  {classrooms.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2">العنوان</label>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) =>
                    setNewAssignment({ ...newAssignment, title: e.target.value })
                  }
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                  placeholder="عنوان الواجب"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2">الوصف</label>
                <textarea
                  value={newAssignment.description}
                  onChange={(e) =>
                    setNewAssignment({ ...newAssignment, description: e.target.value })
                  }
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-blue-500 resize-none"
                  rows="3"
                  placeholder="اكتب وصف الواجب"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2">موعد التسليم</label>
                <input
                  type="datetime-local"
                  value={newAssignment.deadline}
                  onChange={(e) =>
                    setNewAssignment({ ...newAssignment, deadline: e.target.value })
                  }
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2">ملف مرفق</label>
                <input
                  type="file"
                  onChange={(e) =>
                    setNewAssignment({ ...newAssignment, attachment: e.target.files[0] })
                  }
                  className="w-full text-xs sm:text-sm"
                />
              </div>

              <div className="flex gap-2 sm:gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold text-xs sm:text-sm"
                >
                  ✅ حفظ
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 font-semibold text-xs sm:text-sm"
                >
                  ❌ إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Student submit modal */}
      {showStudentSubmitModal && activeAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">تقديم الواجب: {activeAssignment.title}</h3>
              <button onClick={() => setShowStudentSubmitModal(false)} className="text-gray-600">إغلاق</button>
            </div>
            <div className="space-y-3">
              <textarea value={studentSubmissionContent} onChange={(e) => setStudentSubmissionContent(e.target.value)} placeholder="اكتب إجابتك هنا" className="w-full px-2 py-2 border rounded" rows={6} />
              <input type="file" onChange={(e) => setStudentSubmissionFile(e.target.files[0])} />
              <div className="flex gap-2">
                <button onClick={async () => {
                  try {
                    const form = new FormData();
                    form.append('content', studentSubmissionContent);
                    if (studentSubmissionFile) form.append('attachment', studentSubmissionFile);
                    await axios.post(`/assignments/${activeAssignment._id}/submit`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
                    alert('تم الإرسال');
                    setShowStudentSubmitModal(false);
                    setStudentSubmissionContent('');
                    setStudentSubmissionFile(null);
                    fetchData();
                  } catch (err) {
                    alert('خطأ في الإرسال: ' + (err.response?.data?.message || err.message));
                  }
                }} className="bg-blue-600 text-white px-4 py-2 rounded">إرسال</button>
                <button onClick={() => setShowStudentSubmitModal(false)} className="bg-gray-300 px-4 py-2 rounded">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* حوار التقديمات (للمعلم) */}
      {showSubmissionsModal && activeAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-2xl p-4 sm:p-6 w-full max-w-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">تقديمات: {activeAssignment.title}</h3>
              <button onClick={() => setShowSubmissionsModal(false)} className="text-gray-600">إغلاق</button>
            </div>
            {submissions.length === 0 ? (
              <div className="p-4 text-center text-gray-600">لا توجد تقديمات بعد</div>
            ) : (
              <div className="space-y-3">
                {submissions.map((s) => (
                  <div key={s._id || s.student._id} className="p-3 border rounded-lg flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="font-semibold">{s.student?.name || s.student?.email}</div>
                        <div className="text-xs text-gray-500">{s.student?.email}</div>
                      </div>
                      <div className="text-sm text-gray-600">{s.grade ? `الدرجة: ${s.grade}` : 'لم يقم بالتقييم'}</div>
                    </div>
                    <div className="text-sm text-gray-700">{s.content || 'لا يوجد محتوى'}</div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={async () => {
                        // mark correct quickly
                        try {
                          await axios.post(`/assignments/${activeAssignment._id}/grade`, { studentId: s.student._id || s.student, grade: 100, feedback: 'معتمد من المعلم', correct: true });
                          alert('تم اعتماد الواجب للطالب');
                          // refresh
                          const res = await axios.get(`/assignments/${activeAssignment._id}/submissions`);
                          setSubmissions(res.data.submissions || []);
                        } catch (err) {
                          alert('خطأ في التقييم: ' + (err.response?.data?.message || err.message));
                        }
                      }} className="px-3 py-1 rounded bg-green-600 text-white text-xs">اعتماد كـ صحيح</button>
                      <button onClick={async () => {
                        const grade = prompt('أدخل الدرجة (رقم)');
                        if (grade === null) return;
                        const feedback = prompt('ملاحظة/تعليق للطالب (اختياري)') || '';
                        try {
                          await axios.post(`/assignments/${activeAssignment._id}/grade`, { studentId: s.student._id || s.student, grade: Number(grade), feedback, correct: Number(grade) >= 50 });
                          alert('تم حفظ التقييم');
                          const res = await axios.get(`/assignments/${activeAssignment._id}/submissions`);
                          setSubmissions(res.data.submissions || []);
                        } catch (err) {
                          alert('خطأ في التقييم: ' + (err.response?.data?.message || err.message));
                        }
                      }} className="px-3 py-1 rounded bg-blue-600 text-white text-xs">تقييم يدوي</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
