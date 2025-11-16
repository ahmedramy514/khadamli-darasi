import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useParams } from 'react-router-dom';

const AssignmentsPage = () => {
  const { classroomId } = useParams();
  const { user, token } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, upcoming, overdue, submitted

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    deadline: '',
  });

  const [submission, setSubmission] = useState({
    content: '',
    attachments: [],
  });

  useEffect(() => {
    if (token && classroomId) {
      fetchAssignments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomId, token]);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(`/assignments/classroom/${classroomId}`);
      setAssignments(response.data);
      setLoading(false);
    } catch (err) {
      console.error('خطأ في جلب الواجبات:', err);
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newAssignment.title || !newAssignment.deadline) {
      alert('الرجاء ملء العنوان والتاريخ');
      return;
    }

    try {
      const response = await axios.post('/assignments', {
        ...newAssignment,
        classroomId,
      });

      setAssignments([...assignments, response.data.assignment]);
      setNewAssignment({ title: '', description: '', deadline: '' });
      setShowCreateModal(false);
      alert('تم إضافة الواجب بنجاح');
    } catch (err) {
      alert('خطأ: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!submission.content.trim()) {
      alert('الرجاء كتابة محتوى التسليم');
      return;
    }

    try {
      const response = await axios.post(
        `/assignments/${selectedAssignment._id}/submit`,
        submission
      );

      setAssignments(
        assignments.map((a) =>
          a._id === selectedAssignment._id ? response.data.assignment : a
        )
      );
      setSubmission({ content: '', attachments: [] });
      setShowSubmitModal(false);
      setSelectedAssignment(null);
      alert('تم تسليم الواجب بنجاح');
    } catch (err) {
      alert('خطأ: ' + (err.response?.data?.message || err.message));
    }
  };

  const getStatusColor = (assignment) => {
    const now = new Date();
    const deadline = new Date(assignment.deadline);
    const isOverdue = deadline < now;
    const userSubmission = assignment.submissions.find(
      (sub) => sub.student._id === user?.id
    );

    if (userSubmission) return 'green'; // submitted
    if (isOverdue) return 'red'; // overdue
    return 'blue'; // upcoming
  };

  const getStatusLabel = (assignment) => {
    const now = new Date();
    const deadline = new Date(assignment.deadline);
    const isOverdue = deadline < now;
    const userSubmission = assignment.submissions.find(
      (sub) => sub.student._id === user?.id
    );

    if (userSubmission) return '✓ تم التسليم';
    if (isOverdue) return '⚠️ انتهت المهلة';
    return '⏳ متبقي';
  };

  const getFilteredAssignments = () => {
    return assignments.filter((assignment) => {
      if (filterStatus === 'all') return true;

      const now = new Date();
      const deadline = new Date(assignment.deadline);
      const isOverdue = deadline < now;
      const userSubmission = assignment.submissions.find(
        (sub) => sub.student._id === user?.id
      );

      if (filterStatus === 'submitted') return !!userSubmission;
      if (filterStatus === 'overdue') return isOverdue && !userSubmission;
      if (filterStatus === 'upcoming') return !isOverdue && !userSubmission;
      return true;
    });
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

  const filteredAssignments = getFilteredAssignments();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 pt-20 pb-28">
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
              📋 الواجبات
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              إدارة الواجبات والمهام الدراسية
            </p>
          </div>
          {user?.role === 'teacher' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:shadow-lg transition font-semibold text-sm sm:text-base whitespace-nowrap"
            >
              ➕ إضافة واجب
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-2 sm:p-4 mb-6 sm:mb-8">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {['all', 'upcoming', 'overdue', 'submitted'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 sm:px-5 py-2 rounded-lg sm:rounded-lg font-semibold text-xs sm:text-sm transition ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' && '📌 الكل'}
                {status === 'upcoming' && '⏳ قادمة'}
                {status === 'overdue' && '⚠️ انتهت'}
                {status === 'submitted' && '✓ مسلمة'}
              </button>
            ))}
          </div>
        </div>

        {/* Assignments Grid */}
        {filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-md p-8 sm:p-12 text-center">
            <p className="text-gray-600 text-base sm:text-lg">
              📭 لا توجد واجبات في هذه الفئة
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredAssignments.map((assignment) => {
              const userSubmission = assignment.submissions.find(
                (sub) => sub.student._id === user?.id
              );
              const statusColor = getStatusColor(assignment);
              const statusLabel = getStatusLabel(assignment);
              const daysLeft =
                Math.ceil(
                  (new Date(assignment.deadline) - new Date()) / (1000 * 60 * 60 * 24)
                ) || 0;

              return (
                <div
                  key={assignment._id}
                  className={`bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transition border-t-4 ${
                    statusColor === 'green'
                      ? 'border-green-500'
                      : statusColor === 'red'
                      ? 'border-red-500'
                      : 'border-blue-500'
                  } overflow-hidden flex flex-col`}
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 truncate">
                          {assignment.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                          {assignment.createdBy?.name}
                        </p>
                      </div>
                      <span className="text-2xl sm:text-3xl flex-shrink-0">
                        {statusColor === 'green' ? '✓' : statusColor === 'red' ? '⚠️' : '⏳'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-4 flex-grow">
                    <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4 line-clamp-2">
                      {assignment.description}
                    </p>

                    {/* Deadline */}
                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                        <span>📅</span>
                        <span className="font-semibold">
                          {new Date(assignment.deadline).toLocaleDateString('ar-SA')}
                        </span>
                        {daysLeft > 0 && (
                          <span className="text-blue-600 font-semibold">
                            ({daysLeft} أيام)
                          </span>
                        )}
                        {daysLeft < 0 && (
                          <span className="text-red-600 font-semibold">
                            (انتهى من {Math.abs(daysLeft)} أيام)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div
                      className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                        statusColor === 'green'
                          ? 'bg-green-100 text-green-700'
                          : statusColor === 'red'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {statusLabel}
                    </div>

                    {/* Submission Info */}
                    {userSubmission && (
                      <div className="mt-3 sm:mt-4 bg-green-50 p-2 sm:p-3 rounded-lg">
                        <p className="text-xs sm:text-sm text-green-700">
                          تم التسليم في:{' '}
                          <span className="font-semibold">
                            {new Date(userSubmission.submittedAt).toLocaleDateString('ar-SA')}
                          </span>
                        </p>
                        {userSubmission.grade !== 0 && (
                          <p className="text-xs sm:text-sm text-green-700 mt-1">
                            التقييم: <span className="font-semibold">{userSubmission.grade}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="p-3 sm:p-4 border-t border-gray-200">
                    {user?.role === 'teacher' ? (
                      <button className="w-full bg-blue-50 text-blue-600 py-1.5 sm:py-2 rounded-lg hover:bg-blue-100 transition font-semibold text-xs sm:text-sm">
                        📊 عرض التسليمات
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setShowSubmitModal(true);
                        }}
                        disabled={userSubmission}
                        className={`w-full py-1.5 sm:py-2 rounded-lg transition font-semibold text-xs sm:text-sm ${
                          userSubmission
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {userSubmission ? '✓ مسلم' : '📤 تسليم'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">إضافة واجب جديد</h2>

            <form onSubmit={handleCreateAssignment} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-1 sm:mb-2">
                  العنوان
                </label>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) =>
                    setNewAssignment({ ...newAssignment, title: e.target.value })
                  }
                  placeholder="مثال: حل الأسئلة من 1 إلى 10"
                  className="w-full px-2 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-1 sm:mb-2">
                  الوصف
                </label>
                <textarea
                  value={newAssignment.description}
                  onChange={(e) =>
                    setNewAssignment({ ...newAssignment, description: e.target.value })
                  }
                  placeholder="اكتب وصفاً للواجب"
                  className="w-full px-2 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-blue-500 resize-none"
                  rows="4"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-1 sm:mb-2">
                  موعد التسليم
                </label>
                <input
                  type="datetime-local"
                  value={newAssignment.deadline}
                  onChange={(e) =>
                    setNewAssignment({ ...newAssignment, deadline: e.target.value })
                  }
                  className="w-full px-2 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex gap-2 sm:gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold text-xs sm:text-sm"
                >
                  ➕ إضافة
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 text-xs sm:text-sm font-semibold"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Assignment Modal */}
      {showSubmitModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              تسليم: {selectedAssignment.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
              التسليم حتى:{' '}
              {new Date(selectedAssignment.deadline).toLocaleDateString('ar-SA')}
            </p>

            <form onSubmit={handleSubmitAssignment} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-1 sm:mb-2">
                  محتوى التسليم
                </label>
                <textarea
                  value={submission.content}
                  onChange={(e) =>
                    setSubmission({ ...submission, content: e.target.value })
                  }
                  placeholder="اكتب إجابتك أو شرح عملك"
                  className="w-full px-2 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-blue-500 resize-none"
                  rows="5"
                  required
                />
              </div>

              <div className="flex gap-2 sm:gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-xs sm:text-sm"
                >
                  📤 تسليم
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSubmitModal(false);
                    setSelectedAssignment(null);
                    setSubmission({ content: '', attachments: [] });
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 text-xs sm:text-sm font-semibold"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
