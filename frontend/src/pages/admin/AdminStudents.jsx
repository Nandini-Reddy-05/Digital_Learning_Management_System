import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Spinner } from '../../components/Spinner';
import { 
  Search, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  UserPlus, 
  AlertCircle,
  XCircle,
  CheckCircle,
  Mail,
  Phone,
  Calendar,
  MapPin
} from 'lucide-react';

export const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Edit Modal State
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dob: '',
    address: '',
    bio: '',
    isActive: true
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/admin/students');
      setStudents(response.data);
    } catch (err) {
      setError('Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await api.post(`/admin/users/${userId}/toggle`);
      setStudents(prev => prev.map(s => s.userId === userId ? { ...s, isActive: !currentStatus } : s));
      setSuccess('User status updated successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to toggle status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student? This action will delete their login credentials and enrollment progress.')) {
      return;
    }
    try {
      await api.delete(`/admin/students/${studentId}`);
      setStudents(prev => prev.filter(s => s.id !== studentId));
      setSuccess('Student deleted successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to delete student');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setEditForm({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      phone: student.phone || '',
      email: student.email || '',
      dob: student.dob || '',
      address: student.address || '',
      bio: student.bio || '',
      isActive: student.isActive ?? true
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/admin/students/${editingStudent.id}`, editForm);
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? response.data : s));
      setEditingStudent(null);
      setSuccess('Student profile updated successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to update student profile');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Filter students by search
  const filteredStudents = students.filter(s => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const username = (s.username || '').toLowerCase();
    const email = (s.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || username.includes(query) || email.includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Manage Students</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Total registered students: {students.length}</p>
        </div>
      </div>

      {/* Action alerts */}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center gap-2 text-sm font-medium">
          <CheckCircle className="h-5 w-5" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and search */}
      <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm max-w-md items-center gap-3">
        <Search className="h-5 w-5 text-slate-400 shrink-0" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search students by name, email or username..." 
          className="bg-transparent border-none outline-none w-full text-sm font-medium"
        />
      </div>

      {/* Students Table */}
      {loading ? (
        <Spinner size="large" className="py-20" />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/55 dark:bg-slate-900/55">
                  <th className="p-4 font-bold text-slate-500">Student Info</th>
                  <th className="p-4 font-bold text-slate-500">Username</th>
                  <th className="p-4 font-bold text-slate-500">Phone</th>
                  <th className="p-4 font-bold text-slate-500">Joined Date</th>
                  <th className="p-4 font-bold text-slate-500 text-center">Status</th>
                  <th className="p-4 font-bold text-slate-500 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500 dark:text-slate-400">No students found</td>
                  </tr>
                ) : (
                  filteredStudents.map(student => (
                    <tr key={student.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 font-bold flex items-center justify-center">
                            {student.firstName[0]}
                          </div>
                          <div>
                            <h4 className="font-bold">{student.firstName} {student.lastName}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium">{student.username}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{student.phone || 'N/A'}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                        {student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleActive(student.userId, student.isActive)}
                          className={`
                            px-3 py-1 rounded-full text-xs font-bold transition-all border
                            ${student.isActive 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
                              : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'}
                          `}
                        >
                          {student.isActive ? 'Active' : 'Deactivated'}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEditClick(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary-600 transition-all"
                          >
                            <Edit className="h-4.5 w-4.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(student.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-all"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Student Modal Dialog */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-bold">Edit Student Details</h3>
              <button onClick={() => setEditingStudent(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-500">First Name</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    required 
                    value={editForm.firstName} 
                    onChange={handleInputChange} 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-500">Last Name</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    required 
                    value={editForm.lastName} 
                    onChange={handleInputChange} 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-500">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  value={editForm.email} 
                  onChange={handleInputChange} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-500">Phone</label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={editForm.phone} 
                    onChange={handleInputChange} 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-500">Date of Birth</label>
                  <input 
                    type="date" 
                    name="dob" 
                    value={editForm.dob} 
                    onChange={handleInputChange} 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-500">Address</label>
                <textarea 
                  name="address" 
                  value={editForm.address} 
                  onChange={handleInputChange} 
                  rows="2"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-500">Biography</label>
                <textarea 
                  name="bio" 
                  value={editForm.bio} 
                  onChange={handleInputChange} 
                  rows="2"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  name="isActive" 
                  checked={editForm.isActive} 
                  onChange={handleInputChange} 
                  className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
                />
                <label htmlFor="isActive" className="text-sm font-semibold select-none">Active Student Account</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setEditingStudent(null)} 
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-600/20 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
