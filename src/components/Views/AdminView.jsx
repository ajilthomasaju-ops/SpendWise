import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Ban,
  CheckCircle2,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';
import {
  CATEGORY_CHART_PALETTE,
  formatCurrency,
  formatDateLabel,
  getInitials,
} from '../../utils/formatters';
import { CategoryIcon } from '../Common/CategoryIcon';

export function AdminView() {
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [busyUserId, setBusyUserId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.overview();
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load admin console.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const filteredUsers = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.users;
    return data.users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.currency.toLowerCase().includes(q)
    );
  }, [data, search]);

  const handleToggleStatus = async (targetId, currentStatus) => {
    setBusyUserId(targetId);
    setError(null);
    try {
      const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await adminApi.setUserStatus(targetId, nextStatus);
      await loadOverview();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to update user status.'
      );
    } finally {
      setBusyUserId(null);
    }
  };

  const handleDeleteUser = async (targetId) => {
    setBusyUserId(targetId);
    setError(null);
    try {
      await adminApi.deleteUser(targetId);
      setConfirmDeleteId(null);
      await loadOverview();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to remove user account.'
      );
    } finally {
      setBusyUserId(null);
    }
  };

  const currency = user?.currency || 'USD';

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="h-32 animate-pulse rounded-2xl border border-stone-200 bg-white dark:border-white/[0.08] dark:bg-[#111418]"
            />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-2xl border border-stone-200 bg-white dark:border-white/[0.08] dark:bg-[#111418]" />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-[#9A6B29] uppercase dark:text-[#D4A853]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Owner Console · Restricted to {user?.email}</span>
          </div>
          <h1 className="font-editorial mt-1 text-3xl font-medium tracking-tight text-stone-900 dark:text-stone-100">
            Platform Administration
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Manage registered SpendWise members, account access, and aggregate
            ledger activity
          </p>
        </div>

        <button
          type="button"
          onClick={loadOverview}
          disabled={loading}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 text-sm font-medium text-stone-700 shadow-[0_1px_2px_rgba(17,19,21,0.04)] transition-colors hover:bg-stone-50 disabled:opacity-60 dark:border-white/[0.12] dark:bg-[#111418] dark:text-stone-200 dark:hover:bg-white/[0.06] whitespace-nowrap"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Console</span>
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {data && (
        <>
          {/* 4-column Admin KPIs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative overflow-hidden rounded-2xl border border-[#D4A853]/30 bg-gradient-to-br from-[#0D1216] via-[#121A1F] to-[#0B4F44]/95 p-5 text-white shadow-[0_14px_30px_-18px_rgba(11,79,68,0.45)]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4A853] to-transparent opacity-80" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-300">Registered Users</span>
                <Users className="h-4 w-4 text-[#D4A853]" />
              </div>
              <div className="font-mono-num mt-3 text-3xl font-semibold">
                {data.metrics.totalUsers}
              </div>
              <div className="mt-2 text-xs text-stone-300">
                <span className="font-mono-num text-emerald-300">
                  {data.metrics.activeUsers}
                </span>{' '}
                active ·{' '}
                <span className="font-mono-num text-amber-300">
                  {data.metrics.suspendedUsers}
                </span>{' '}
                suspended
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(17,19,21,0.03),0_8px_20px_-14px_rgba(17,19,21,0.08)] transition-colors hover:border-stone-300/90 dark:border-white/[0.08] dark:bg-[#111418] dark:hover:border-white/[0.14]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                  Total Ledger Entries
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-[#0B4F44] ring-1 ring-[#0B4F44]/10 dark:bg-emerald-950/60 dark:text-emerald-400 dark:ring-emerald-400/15">
                  <Activity className="h-4 w-4" />
                </div>
              </div>
              <div className="font-mono-num mt-3 text-2xl font-semibold text-stone-900 dark:text-white">
                {data.metrics.totalTransactions}
              </div>
              <div className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                Across{' '}
                <span className="font-mono-num">
                  {data.metrics.totalBudgets}
                </span>{' '}
                configured budgets
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(17,19,21,0.03),0_8px_20px_-14px_rgba(17,19,21,0.08)] transition-colors hover:border-stone-300/90 dark:border-white/[0.08] dark:bg-[#111418] dark:hover:border-white/[0.14]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                  Platform Expense Volume
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-[#B4833E] ring-1 ring-[#B4833E]/15 dark:bg-[#D4A853]/15 dark:text-[#D4A853] dark:ring-[#D4A853]/20">
                  <Wallet className="h-4 w-4" />
                </div>
              </div>
              <div className="font-mono-num mt-3 text-2xl font-semibold text-stone-900 dark:text-white">
                {formatCurrency(data.metrics.totalExpenseVolume, currency, true)}
              </div>
              <div className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                Cumulative recorded outflows
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(17,19,21,0.03),0_8px_20px_-14px_rgba(17,19,21,0.08)] transition-colors hover:border-stone-300/90 dark:border-white/[0.08] dark:bg-[#111418] dark:hover:border-white/[0.14]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                  Platform Income Volume
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-700 ring-1 ring-stone-200/80 dark:bg-white/[0.06] dark:text-emerald-400 dark:ring-white/[0.08]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="font-mono-num mt-3 text-2xl font-semibold text-[#0B4F44] dark:text-emerald-400">
                {formatCurrency(data.metrics.totalIncomeVolume, currency, true)}
              </div>
              <div className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                Cumulative recorded inflows
              </div>
            </div>
          </div>

          {/* User Directory Table */}
          <section className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[0_1px_2px_rgba(17,19,21,0.03),0_10px_24px_-14px_rgba(17,19,21,0.08)] dark:border-white/[0.08] dark:bg-[#111418]">
            <div className="flex flex-col justify-between gap-3 border-b border-stone-200/80 p-5 sm:flex-row sm:items-center dark:border-white/[0.08]">
              <div>
                <h2 className="font-editorial text-lg font-medium text-stone-900 dark:text-white">
                  User Directory
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Suspend or remove non-admin accounts across the application
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, currency..."
                  aria-label="Search users"
                  className="h-9 w-full rounded-xl border border-stone-300 bg-white pr-3 pl-9 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#0B4F44] focus:outline-none dark:border-white/[0.12] dark:bg-[#0A0C0E] dark:text-stone-100 dark:focus:border-[#D4A853]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200/80 bg-[#FAF9F6] text-[11px] font-semibold tracking-[0.08em] text-stone-500 uppercase dark:border-white/[0.08] dark:bg-[#0D1014] dark:text-stone-400">
                    <th className="px-5 py-3.5">Member</th>
                    <th className="px-5 py-3.5">Role &amp; Status</th>
                    <th className="px-5 py-3.5 text-right">Entries</th>
                    <th className="px-5 py-3.5 text-right">Total Spent</th>
                    <th className="hidden px-5 py-3.5 md:table-cell">Joined</th>
                    <th className="px-5 py-3.5 text-right">Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/75 dark:divide-white/[0.06]">
                  {filteredUsers.map((member) => {
                    const isOwner = member.role === 'admin';
                    const isBusy = busyUserId === member._id;
                    return (
                      <tr
                        key={member._id}
                        className="transition-colors hover:bg-[#FAF9F6] dark:hover:bg-white/[0.03]"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold ${
                                isOwner
                                  ? 'bg-[#0E1318] text-[#D4A853] ring-1 ring-[#D4A853]/35'
                                  : 'bg-stone-100 text-stone-700 dark:bg-white/[0.06] dark:text-stone-300'
                              }`}
                            >
                              {getInitials(member.name)}
                            </div>
                            <div>
                              <div className="font-medium text-stone-900 dark:text-stone-100">
                                {member.name}
                              </div>
                              <div className="font-mono-num text-xs text-stone-500 dark:text-stone-400">
                                {member.email} · {member.currency}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs whitespace-nowrap">
                          <span
                            className={
                              isOwner
                                ? 'font-semibold text-[#B4833E] dark:text-[#D4A853]'
                                : 'text-stone-700 dark:text-stone-300'
                            }
                          >
                            {isOwner ? 'Owner Admin' : 'Member'}
                          </span>
                          <span
                            aria-hidden="true"
                            className="mx-1.5 text-stone-300 dark:text-stone-700"
                          >
                            ·
                          </span>
                          <span
                            className={
                              member.status === 'suspended'
                                ? 'font-medium text-red-600 dark:text-red-400'
                                : 'font-medium text-[#0B4F44] dark:text-emerald-400'
                            }
                          >
                            {member.status === 'suspended'
                              ? 'Suspended'
                              : 'Active'}
                          </span>
                        </td>
                        <td className="font-mono-num px-5 py-3.5 text-right text-stone-700 dark:text-stone-300">
                          {member.transactionCount}
                        </td>
                        <td className="font-mono-num px-5 py-3.5 text-right font-medium text-stone-900 dark:text-stone-100">
                          {formatCurrency(member.totalExpenses, member.currency)}
                        </td>
                        <td className="font-mono-num hidden px-5 py-3.5 text-xs text-stone-500 md:table-cell dark:text-stone-400 whitespace-nowrap">
                          {formatDateLabel(member.createdAt.slice(0, 10))}
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          {isOwner ? (
                            <span className="text-xs text-stone-400 dark:text-stone-500">
                              Protected
                            </span>
                          ) : confirmDeleteId === member._id ? (
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleDeleteUser(member._id)}
                                className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                              >
                                Confirm Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-xs text-stone-500 hover:underline dark:text-stone-400"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() =>
                                  handleToggleStatus(member._id, member.status)
                                }
                                title={
                                  member.status === 'active'
                                    ? 'Suspend account'
                                    : 'Reactivate account'
                                }
                                className="inline-flex h-8 items-center gap-1 rounded-lg border border-stone-200 px-2.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 dark:border-white/[0.1] dark:text-stone-300 dark:hover:bg-white/[0.06]"
                              >
                                <Ban className="h-3 w-3" />
                                <span>
                                  {member.status === 'active'
                                    ? 'Suspend'
                                    : 'Activate'}
                                </span>
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => setConfirmDeleteId(member._id)}
                                aria-label={`Delete ${member.email}`}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-red-50 hover:text-red-600 dark:text-stone-400 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Bottom 2-column platform insights */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <section className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-[0_1px_2px_rgba(17,19,21,0.03),0_10px_24px_-14px_rgba(17,19,21,0.08)] lg:col-span-5 dark:border-white/[0.08] dark:bg-[#111418]">
              <div className="border-b border-stone-200/70 pb-4 dark:border-white/[0.07]">
                <h2 className="font-editorial text-lg font-medium text-stone-900 dark:text-white">
                  Top Expense Categories
                </h2>
                <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                  Aggregate outflows across all members
                </p>
              </div>

              {data.topCategories.length === 0 ? (
                <p className="py-8 text-sm text-stone-500 dark:text-stone-400">
                  No category expense volume recorded yet.
                </p>
              ) : (
                <div className="mt-5 space-y-3.5">
                  {data.topCategories.map((cat, idx) => {
                    const maxVal = data.topCategories[0]?.amount || 1;
                    const pct = Math.min(100, (cat.amount / maxVal) * 100);
                    const color =
                      CATEGORY_CHART_PALETTE[
                        idx % CATEGORY_CHART_PALETTE.length
                      ];
                    return (
                      <div key={cat.category} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-stone-800 dark:text-stone-200">
                            {cat.category}
                          </span>
                          <span className="font-mono-num text-stone-600 dark:text-stone-400">
                            {formatCurrency(cat.amount, currency)} · {cat.count}{' '}
                            entries
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-white/[0.06]">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-[0_1px_2px_rgba(17,19,21,0.03),0_10px_24px_-14px_rgba(17,19,21,0.08)] lg:col-span-7 dark:border-white/[0.08] dark:bg-[#111418]">
              <div className="border-b border-stone-200/70 pb-4 dark:border-white/[0.07]">
                <h2 className="font-editorial text-lg font-medium text-stone-900 dark:text-white">
                  Recent Platform Activity
                </h2>
                <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                  Latest ledger entries submitted across user accounts
                </p>
              </div>

              {data.recentTransactions.length === 0 ? (
                <p className="py-8 text-sm text-stone-500 dark:text-stone-400">
                  No transactions recorded on the platform yet.
                </p>
              ) : (
                <div className="mt-3 divide-y divide-stone-200/75 dark:divide-white/[0.06]">
                  {data.recentTransactions.slice(0, 8).map((tx) => (
                    <div
                      key={tx._id}
                      className="-mx-2.5 flex items-center justify-between gap-3 rounded-xl px-2.5 py-3 text-sm transition-colors hover:bg-[#FAF9F6] dark:hover:bg-white/[0.03]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <CategoryIcon category={tx.category} size="sm" />
                        <div className="min-w-0">
                          <div className="truncate font-medium text-stone-900 dark:text-stone-100">
                            {tx.title}
                          </div>
                          <div className="truncate text-xs text-stone-500 dark:text-stone-400">
                            {tx.ownerName} ({tx.ownerEmail}) ·{' '}
                            {formatDateLabel(tx.date)}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`font-mono-num shrink-0 font-semibold ${
                          tx.type === 'income'
                            ? 'text-[#0B4F44] dark:text-emerald-400'
                            : 'text-stone-900 dark:text-stone-100'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount, tx.ownerCurrency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
