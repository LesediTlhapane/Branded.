import React, { useState } from 'react';
import { ShieldAlert, KeyRound, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export const ForcePasswordModal: React.FC = () => {
  const { user, requiresPasswordChange, completePasswordChange } = useAuth();
  const { showToast } = useNotification();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  if (!user || !requiresPasswordChange) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const res = completePasswordChange(newPassword);
    if (res.success) {
      showToast('Password updated successfully! Welcome to the platform.', 'success');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl max-w-md w-full p-6 shadow-2xl text-[#D4D4D8]">
        <div className="flex items-center gap-3 mb-4 text-[#F59E0B]">
          <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <ShieldAlert className="w-6 h-6 text-[#F59E0B]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Security Password Update</h2>
            <p className="text-xs text-[#71717A]">First login security requirement</p>
          </div>
        </div>

        <p className="text-xs text-[#71717A] mb-5 leading-relaxed">
          Hello <strong className="text-white">{user.name}</strong>. Because this is your first login, you must create a new password before continuing.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#71717A] mb-1.5 uppercase tracking-widest text-[10px]">
              New Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#71717A] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F59E0B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#71717A] mb-1.5 uppercase tracking-widest text-[10px]">
              Confirm New Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#71717A] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full pl-9 pr-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F59E0B]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 px-4 bg-[#F59E0B] hover:bg-amber-400 text-black font-bold text-xs rounded-full transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Update Password & Continue
          </button>
        </form>
      </div>
    </div>
  );
};
