import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '../../components/Spinner';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  Upload,
  Calendar,
  MapPin
} from 'lucide-react';

export const StudentProfile = () => {
  const { user, changePassword } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Forms States
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dob: '',
    address: '',
    bio: '',
    profileImage: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/student/profile');
      setProfile(response.data);
      setProfileForm({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        phone: response.data.phone || '',
        dob: response.data.dob || '',
        address: response.data.address || '',
        bio: response.data.bio || '',
        profileImage: response.data.profileImage || ''
      });
    } catch (err) {
      setError('Failed to fetch profile details');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      const res = await api.put('/student/profile', profileForm);
      setProfile(res.data);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setError('');
      setSuccess('');
      await changePassword(passwordForm.oldPassword, passwordForm.newPassword);
      setSuccess('Password updated successfully');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = new FormData();
      data.append('file', file);
      const res = await api.post('/files/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfileForm(prev => ({ ...prev, profileImage: res.data.filePath }));
      setSuccess('Profile picture loaded. Submit form to save.');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to upload picture');
    }
  };

  if (loading) return <Spinner size="large" className="min-h-[60vh]" />;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account details and password settings</p>
      </div>

      {/* Alerts */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col items-center">
          <div className="h-32 w-32 rounded-full border-4 border-primary-500/20 relative overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800">
            {profileForm.profileImage ? (
              <img src={`/${profileForm.profileImage}`} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <User className="h-16 w-16 text-slate-400" />
            )}
            <input type="file" accept="image/*" onChange={handleFileUpload} id="avatarUpload" className="hidden"/>
            <label htmlFor="avatarUpload" className="absolute bottom-0 inset-x-0 bg-slate-900/60 hover:bg-slate-900/80 cursor-pointer text-white flex items-center justify-center py-1 text-[10px] font-bold">
              <Upload className="h-3 w-3 mr-1" />
              <span>Change</span>
            </label>
          </div>

          <div className="text-center space-y-1">
            <h3 className="font-extrabold text-lg">{profile?.firstName} {profile?.lastName}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Student | {profile?.username}</p>
          </div>

          <div className="w-full space-y-3 text-xs font-semibold border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="flex items-center gap-2 text-slate-650 dark:text-slate-350">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>{profile?.email}</span>
            </div>
            {profile?.phone && (
              <div className="flex items-center gap-2 text-slate-650 dark:text-slate-350">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>{profile?.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-lg border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">Edit Profile details</h3>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-500">First Name</label>
                  <input type="text" required value={profileForm.firstName} onChange={e => setProfileForm(prev=>({...prev, firstName: e.target.value}))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-500">Last Name</label>
                  <input type="text" required value={profileForm.lastName} onChange={e => setProfileForm(prev=>({...prev, lastName: e.target.value}))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-500">Phone</label>
                  <input type="text" value={profileForm.phone} onChange={e => setProfileForm(prev=>({...prev, phone: e.target.value}))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-500">Date of Birth</label>
                  <input type="date" value={profileForm.dob} onChange={e => setProfileForm(prev=>({...prev, dob: e.target.value}))} className="w-full bg-slate-50 dark:bg-slate-805 border border-slate-205 dark:border-slate-705 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"/>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-500">Address</label>
                <textarea rows="2" value={profileForm.address} onChange={e => setProfileForm(prev=>({...prev, address: e.target.value}))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium resize-none"/>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-500">Biography</label>
                <textarea rows="3" value={profileForm.bio} onChange={e => setProfileForm(prev=>({...prev, bio: e.target.value}))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium resize-none"/>
              </div>

              <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-lg shadow-primary-600/20 transition-all">Save Changes</button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-lg border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">Update Password</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-500">Current Password</label>
                  <input type="password" required value={passwordForm.oldPassword} onChange={e => setPasswordForm(prev=>({...prev, oldPassword: e.target.value}))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-500">New Password</label>
                  <input type="password" required value={passwordForm.newPassword} onChange={e => setPasswordForm(prev=>({...prev, newPassword: e.target.value}))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-500">Confirm New Password</label>
                  <input type="password" required value={passwordForm.confirmPassword} onChange={e => setPasswordForm(prev=>({...prev, confirmPassword: e.target.value}))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"/>
                </div>
              </div>

              <button type="submit" className="bg-slate-850 hover:bg-slate-800 border border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold py-2.5 px-6 rounded-xl text-xs transition-all">Change Password</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
