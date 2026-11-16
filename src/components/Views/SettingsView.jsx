import { useState } from 'react';
import { LogOut, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CURRENCY_CONFIG } from '../../types/finance';
import { formatCurrency, getInitials } from '../../utils/formatters';

export function SettingsView() {
  const { user, updateProfile, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [monthlyIncomeGoal, setMonthlyIncomeGoal] = useState(
    String(user?.monthlyIncomeGoal ?? 5000)
  );
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(null);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileStatus(null);
    setProfileSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        currency,
        monthlyIncomeGoal: Number(monthlyIncomeGoal) || 0,
      });
      setProfileStatus({
        type: 'success',
        text: 'Profile and currency preferences saved.',
      });
    } catch (err) {
      setProfileStatus({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update profile.',
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordStatus(null);
    setPasswordSaving(true);
    try {
      await updateProfile({
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setPasswordStatus({
        type: 'success',
        text: 'Password updated successfully.',
      });
    } catch (err) {
      setPasswordStatus({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update password.',
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[#9A6B29] uppercase dark:text-[#D4A853]">
          Workspace Preferences
        </p>
        <h1 className="font-editorial mt-1 text-3xl font-medium tracking-tight text-stone-900 dark:text-stone-100">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Manage your profile, currency formatting, and security credentials
        </p>
      </div>

      {/* Private Member Summary Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[#D4A853]/30 bg-gradient-to-br from-[#0D1216] via-[#121A1F] to-[#0B4F44]/95 p-6 text-white shadow-[0_14px_32px_-16px_rgba(11,79,68,0.45)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4A853] to-transparent opacity-80" />
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sm font-semibold text-[#E6C37A] ring-1 ring-[#D4A853]/40">
              {getInitials(user?.name || 'User')}
            </div>
            <div>
              <div className="font-editorial text-lg font-medium text-white">
                {user?.name}
              </div>
              <div className="font-mono-num text-xs text-stone-300">
                {user?.email}
              </div>
            </div>
          </div>

          <div className="flex items-center divide-x divide-white/15 text-xs">
            <div className="pr-4">
              <div className="text-stone-400">Currency</div>
              <div className="font-mono-num mt-0.5 font-semibold text-[#E6C37A]">
                {user?.currency || 'USD'}
              </div>
            </div>
            <div className="pl-4">
              <div className="text-stone-400">Monthly Target</div>
              <div className="font-mono-num mt-0.5 font-semibold text-white">
                {formatCurrency(
                  user?.monthlyIncomeGoal || 0,
                  user?.currency || 'USD',
                  true
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Preferences */}
      <form
        onSubmit={handleProfileSave}
        className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-[0_1px_2px_rgba(17,19,21,0.03),0_10px_24px_-14px_rgba(17,19,21,0.08)] dark:border-white/[0.08] dark:bg-[#111418]"
      >
        <div className="flex items-center gap-3 border-b border-stone-200/70 pb-4 dark:border-white/[0.07]">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-[#0B4F44] ring-1 ring-[#0B4F44]/10 dark:bg-emerald-950/60 dark:text-emerald-400 dark:ring-emerald-400/15">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-editorial text-base font-medium text-stone-900 dark:text-white">
              Profile &amp; Currency
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Signed in as <span className="font-mono-num">{user?.email}</span>
            </p>
          </div>
        </div>

        {profileStatus && (
          <div
            className={`mt-4 rounded-xl border px-3.5 py-2.5 text-sm ${
              profileStatus.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'
            }`}
          >
            {profileStatus.text}
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="settings-name"
              className="mb-1.5 block text-xs font-medium tracking-wide text-stone-600 dark:text-stone-400"
            >
              Full Name
            </label>
            <input
              id="settings-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-[#0B4F44] focus:outline-none dark:border-white/[0.12] dark:bg-[#0A0C0E] dark:text-stone-100 dark:focus:border-[#D4A853]"
            />
          </div>

          <div>
            <label
              htmlFor="settings-currency"
              className="mb-1.5 block text-xs font-medium tracking-wide text-stone-600 dark:text-stone-400"
            >
              Display Currency
            </label>
            <select
              id="settings-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-[#0B4F44] focus:outline-none dark:border-white/[0.12] dark:bg-[#0A0C0E] dark:text-stone-100 dark:focus:border-[#D4A853]"
            >
              {Object.keys(CURRENCY_CONFIG).map((code) => (
                <option key={code} value={code}>
                  {CURRENCY_CONFIG[code].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="settings-goal"
              className="mb-1.5 block text-xs font-medium tracking-wide text-stone-600 dark:text-stone-400"
            >
              Monthly Income Target
            </label>
            <input
              id="settings-goal"
              type="number"
              min="0"
              step="100"
              value={monthlyIncomeGoal}
              onChange={(e) => setMonthlyIncomeGoal(e.target.value)}
              className="font-mono-num w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-[#0B4F44] focus:outline-none dark:border-white/[0.12] dark:bg-[#0A0C0E] dark:text-stone-100 dark:focus:border-[#D4A853]"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={profileSaving}
            className="rounded-xl bg-[#0B4F44] px-5 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-[#083D34] disabled:opacity-60 dark:bg-[#D4A853] dark:text-[#0A0C0E] dark:hover:bg-[#E0B96B]"
          >
            {profileSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>

      {/* Change Password */}
      <form
        onSubmit={handlePasswordSave}
        className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-[0_1px_2px_rgba(17,19,21,0.03),0_10px_24px_-14px_rgba(17,19,21,0.08)] dark:border-white/[0.08] dark:bg-[#111418]"
      >
        <div className="flex items-center gap-3 border-b border-stone-200/70 pb-4 dark:border-white/[0.07]">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-700 ring-1 ring-stone-200/80 dark:bg-white/[0.06] dark:text-[#D4A853] dark:ring-white/[0.08]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-editorial text-base font-medium text-stone-900 dark:text-white">
              Security &amp; Password
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Update your password used to authenticate JWT sessions
            </p>
          </div>
        </div>

        {passwordStatus && (
          <div
            className={`mt-4 rounded-xl border px-3.5 py-2.5 text-sm ${
              passwordStatus.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'
            }`}
          >
            {passwordStatus.text}
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="current-password"
              className="mb-1.5 block text-xs font-medium tracking-wide text-stone-600 dark:text-stone-400"
            >
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-[#0B4F44] focus:outline-none dark:border-white/[0.12] dark:bg-[#0A0C0E] dark:text-stone-100 dark:focus:border-[#D4A853]"
            />
          </div>

          <div>
            <label
              htmlFor="new-password"
              className="mb-1.5 block text-xs font-medium tracking-wide text-stone-600 dark:text-stone-400"
            >
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-[#0B4F44] focus:outline-none dark:border-white/[0.12] dark:bg-[#0A0C0E] dark:text-stone-100 dark:focus:border-[#D4A853]"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={passwordSaving}
            className="rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-800 transition-colors hover:bg-stone-50 disabled:opacity-60 dark:border-white/[0.12] dark:bg-white/[0.04] dark:text-stone-100 dark:hover:bg-white/[0.08]"
          >
            {passwordSaving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>

      {/* Sign Out */}
      <div className="flex items-center justify-between rounded-2xl border border-stone-200/90 bg-white p-6 shadow-[0_1px_2px_rgba(17,19,21,0.03),0_10px_24px_-14px_rgba(17,19,21,0.08)] dark:border-white/[0.08] dark:bg-[#111418]">
        <div>
          <h2 className="font-editorial text-base font-medium text-stone-900 dark:text-white">
            Active Session
          </h2>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Sign out of SpendWise on this browser
          </p>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 whitespace-nowrap"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}
