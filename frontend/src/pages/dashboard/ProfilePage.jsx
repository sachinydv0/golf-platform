import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';
import useAuthStore from '../../context/authStore';

export default function ProfilePage() {
  const { user, refreshUser } = useAuthStore();
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.updateProfile(form);
      await refreshUser();
      toast.success('Profile updated');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSavingPw(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setSavingPw(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-extrabold text-3xl text-white mb-1">Profile</h1>
        <p className="text-dark-300 font-body text-sm">Manage your account details.</p>
      </motion.div>

      {/* Profile */}
      <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        onSubmit={saveProfile} className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-semibold text-white">Personal Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-dark-200 text-xs font-body mb-1.5">First name</label>
            <input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </div>
          <div>
            <label className="block text-dark-200 text-xs font-body mb-1.5">Last name</label>
            <input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-dark-200 text-xs font-body mb-1.5">Email</label>
          <input className="input opacity-60 cursor-not-allowed" value={user?.email} disabled />
        </div>
        <button type="submit" disabled={saving} className="btn-brand py-2.5 px-6 disabled:opacity-60">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </motion.form>

      {/* Password */}
      <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        onSubmit={savePassword} className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-semibold text-white">Change Password</h2>
        {[
          { key: 'currentPassword', label: 'Current password', ph: '••••••••' },
          { key: 'newPassword',     label: 'New password',     ph: 'Min 6 characters' },
          { key: 'confirm',         label: 'Confirm new password', ph: '••••••••' },
        ].map(({ key, label, ph }) => (
          <div key={key}>
            <label className="block text-dark-200 text-xs font-body mb-1.5">{label}</label>
            <input type="password" required placeholder={ph} className="input"
              value={pwForm[key]} onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })} />
          </div>
        ))}
        <button type="submit" disabled={savingPw} className="btn-ghost py-2.5 px-6 disabled:opacity-60">
          {savingPw ? 'Updating…' : 'Update password'}
        </button>
      </motion.form>
    </div>
  );
}
