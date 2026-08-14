import React, { useState } from 'react';
import { UserPlus, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { User } from '../../types';
import { AuthService } from '../../services/AuthService';
import { useNotification } from '../../context/NotificationContext';

export const StaffManager: React.FC = () => {
  const { showToast } = useNotification();
  const [users, setUsers] = useState<User[]>(AuthService.getAllUsers());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('TempPassword123!');
  const [role, setRole] = useState<'ADMIN' | 'STAFF'>('STAFF');

  const refreshUsers = () => setUsers(AuthService.getAllUsers());

  const handleToggleActive = (userId: string) => {
    const res = AuthService.toggleUserActive(userId);
    if (res.success) {
      showToast(res.message, 'info');
      refreshUsers();
    }
  };

  const handleResetPassword = (userId: string) => {
    const res = AuthService.resetUserPasswordToTemp(userId, 'ResetPass2026!');
    if (res.success) {
      showToast('Temporary password set to: ResetPass2026! User forced to change password on next login.', 'success');
      refreshUsers();
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const res = AuthService.createUser({ name, email, password, role });
    if (res.success) {
      showToast(res.message, 'success');
      setIsModalOpen(false);
      setName('');
      setEmail('');
      refreshUsers();
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-serif italic text-white tracking-tight">Staff Credentials</h1>
          <p className="text-xs text-[#71717A] mt-1">
            Manage staff authorization, access privileges, and security credentials.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2 bg-[#F59E0B] hover:bg-amber-400 text-black font-bold text-xs rounded-full shadow-lg shadow-amber-500/10 flex items-center gap-1.5 transition-all"
        >
          <UserPlus className="w-4 h-4 stroke-[3]" /> Create Staff Account
        </button>
      </div>

      <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#050505] text-[#71717A] font-semibold uppercase tracking-widest text-[10px] border-b border-white/5">
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">First Login Status</th>
              <th className="p-4">Account Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4">
                  <div className="font-bold text-white">{u.name}</div>
                  <div className="text-[11px] text-[#71717A] font-mono">{u.email}</div>
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      u.role === 'ADMIN'
                        ? 'bg-amber-500/10 text-[#F59E0B] border border-amber-500/20'
                        : 'bg-white/5 text-[#D4D4D8] border border-white/10'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="p-4">
                  {u.mustChangePassword ? (
                    <span className="text-amber-500 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 text-[10px]">
                      Must Change Password
                    </span>
                  ) : (
                    <span className="text-[#71717A] font-medium">Active Password</span>
                  )}
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold ${
                      u.isActive
                        ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {u.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => handleResetPassword(u.id)}
                    title="Reset to Temp Password"
                    className="p-1.5 bg-[#050505] hover:bg-white/5 text-[#F59E0B] rounded-lg border border-white/5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(u.id)}
                    title={u.isActive ? 'Disable User' : 'Enable User'}
                    className="p-1.5 bg-[#050505] hover:bg-white/5 text-[#71717A] hover:text-white rounded-lg border border-white/5 transition-colors"
                  >
                    {u.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-rose-400" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Create New Staff User</h3>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#71717A] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Lerato Khumalo"
                  className="w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#71717A] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="lerato@brandedsolutions.co.za"
                  className="w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#71717A] mb-1">Temporary Password *</label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#71717A] mb-1">Role *</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                >
                  <option value="STAFF">Staff User (Discount Ceiling Enforcement)</option>
                  <option value="ADMIN">Admin User (Unrestricted Approval)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#050505] text-[#71717A] hover:text-white text-xs font-semibold rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#F59E0B] hover:bg-amber-400 text-black text-xs font-bold rounded-full"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
