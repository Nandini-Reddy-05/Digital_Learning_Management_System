import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Spinner } from '../../components/Spinner';
import { 
  Search, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  AlertCircle,
  CheckCircle,
  Award,
  BookOpen
} from 'lucide-react';

export const AdminTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Edit Modal State
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    specialization: '',
    qualification: '',
    bio: '',
    isActive: true
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/admin/teachers');
      setTeachers(response.data);
    } catch (err) {
      setError('Failed to fetch teachers.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await api.post(`/admin/users/${userId}/toggle`);
      setTeachers(prev => prev.map(t => t.userId === userId ? { ...t, isActive: !currentStatus } : t));
      setSuccess('User status updated successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to toggle status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (teacherId) => {
    if (!window.confirm('Are you sure you want to delete this teacher? This action will delete their login credentials and all courses taught by them.')) {
      return;
    }
    try {
      await api.delete(`/admin/teachers/${teacherId}`);
      setTeachers(prev => prev.filter(t => t.id !== teacherId));
      setSuccess('Teacher deleted successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to delete teacher');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEditClick = (teacher) => {
    setEditingTeacher(teacher);
    setEditForm({
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      phone: teacher.phone || '',
      email: teacher.email || '',
      specialization: teacher.specialization || '',
      qualification: teacher.qualification || '',
      bio: teacher.bio || '',
      isActive: teacher.isActive ?? true
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/admin/teachers/${editingTeacher.id}`, editForm);
      setTeachers(prev => prev.map(t => t.id === editingTeacher.id ? response.data : t));
      setEditingTeacher(null);
      setSuccess('Teacher profile updated successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to update teacher profile');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const filteredTeachers = teachers.filter(t => {
    const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
    const username = (t.username || '').toLowerCase();
    const email = (t.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || username.includes(query) || email.includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Manage Teachers</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Total registered teachers: {teachers.length}</p>
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
          placeholder="Search teachers by name, email or specialization..." 
          className="bg-transparent border-none outline-none w-full text-sm font-medium"
        />
      </div>

      {/* Teachers Table */}
      {loading ? (
        <Spinner size="large" className="py-20" />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/55 dark:bg-slate-900/55">
                  <th className="p-4 font-bold text-slate-500">Teacher Info</th>
                  <th className="p-4 font-bold text-slate-500">Specialization</th>
                  <th className="p-4 font-bold text-slate-500">Qualification</th>
                  <th className="p-4 font-bold text-slate-500">Phone</th>
                  <th className="p-4 font-bold text-slate-500 text-center">Status</th>
                  <th className="p-4 font-bold text-slate-500 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500 dark:text-slate-400">No teachers found</td>
                  </tr>
                ) : (
                  filteredTeachers.map(teacher => (
                    <tr key={teacher.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 font-bold flex items-center justify-center">
                            {teacher.firstName[0]}
                          </div>
                          <div>
                            <h4 className="font-bold">{teacher.firstName} {teacher.lastName}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{teacher.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium">{teacher.specialization || 'N/A'}</td>
                      <td className="p-4 font-medium">{teacher.qualification || 'N/A'}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{teacher.phone || 'N/A'}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleActive(teacher.userId, teacher.isActive)}
                          className={`
                            px-3 py-1 rounded-full text-xs font-bold transition-all border
                            ${teacher.isActive 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
                              : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'}
                          `}
                        >
                          {teacher.isActive ? 'Active' : 'Deactivated'}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEditClick(teacher)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary-600 transition-all"
                          >
                            <Edit className="h-4.5 w-4.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(teacher.id)}
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

      {/* Edit Teacher Modal Dialog */}
      {editingTeacher && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-bold">Edit Teacher Details</h3>
              <button onClick={() => setEditingTeacher(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-500">Specialization</label>
                  <input 
                    type="text" 
                    name="specialization" 
                    required
                    value={editForm.specialization} 
                    onChange={handleInputChange} 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-500">Qualification</label>
                  <input 
                    type="text" 
                    name="qualification" 
                    required
                    value={editForm.qualification} 
                    onChange={handleInputChange} 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-500">Biography</label>
                <textarea 
                  name="bio" 
                  value={editForm.bio} 
                  onChange={handleInputChange} 
                  rows="3"
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
                <label htmlFor="isActive" className="text-sm font-semibold select-none">Active Teacher Account</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setEditingTeacher(null)} 
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
