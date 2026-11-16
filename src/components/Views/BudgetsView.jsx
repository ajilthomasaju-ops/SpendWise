import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useExpenses } from '../../context/ExpenseContext';
import { EXPENSE_CATEGORIES } from '../../types/finance';
import { formatCurrency, formatMonthLabel } from '../../utils/formatters';
import { CategoryIcon } from '../Common/CategoryIcon';

export function BudgetsView() {
  const { user } = useAuth();
  const { budgets, selectedMonth, saveBudget, removeBudget } = useExpenses();

  const currency = user?.currency || 'USD';

  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [limit, setLimit] = useState('400');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingLimit, setEditingLimit] = useState('');

  const totals = useMemo(() => {
    const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
    const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
    return {
      totalLimit,
      totalSpent,
      remaining: totalLimit - totalSpent,
    };
  }, [budgets]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    const num = Number(limit);
    if (!Number.isFinite(num) || num <= 0) {
      setError('Enter a monthly cap greater than zero.');
      return;
    }
    setSaving(true);
    try {
      await saveBudget(category, num);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save budget.');
    } finally {
      setSaving(false);
    }
  };

  const handleInlineUpdate = async (cat) => {
    const num = Number(editingLimit);
    if (!Number.isFinite(num) || num <= 0) return;
    await saveBudget(cat, num);
    setEditingCategory(null);
  };

  const utilizationPct =
    totals.totalLimit > 0
      ? Math.min(100, (totals.totalSpent / totals.totalLimit) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[#9A6B29] uppercase dark:text-[#D4A853]">
          Allocation Controls
        </p>
        <h1 className="font-editorial mt-1 text-3xl font-medium tracking-tight text-stone-900 dark:text-stone-100">
          Category Budgets
        </h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Monthly spending limits evaluated for {formatMonthLabel(selectedMonth)}
        </p>
      </div>

      {/* 3-card Budget Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-[#D4A853]/30 bg-gradient-to-br from-[#0D1216] via-[#121A1F] to-[#0B4F44]/95 p-5 text-white shadow-[0_14px_30px_-18px_rgba(11,79,68,0.45)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4A853] to-transparent opacity-80" />
          <div className="flex items-center justify-between text-xs text-stone-300">
            <span>Total Allocated Budget</span>
            <span className="font-mono-num text-[#E6C37A]">
              {utilizationPct.toFixed(0)}% used
            </span>
          </div>
          <div className="font-mono-num mt-3 text-2xl font-semibold text-white">
            {formatCurrency(totals.totalLimit, currency)}
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#D4A853] transition-all"
              style={{ width: `${utilizationPct}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(17,19,21,0.03),0_8px_20px_-14px_rgba(17,19,21,0.08)] dark:border-white/[0.08] dark:bg-[#111418]">
          <div className="text-xs font-medium text-stone-500 dark:text-stone-400">
            Spent Against Budgets
          </div>
          <div className="font-mono-num mt-2 text-2xl font-semibold text-stone-900 dark:text-white">
            {formatCurrency(totals.totalSpent, currency)}
          </div>
          <div className="mt-2 text-xs text-stone-500 dark:text-stone-400">
            Across{' '}
            <span className="font-mono-num font-medium text-stone-700 dark:text-stone-300">
              {budgets.length}
            </span>{' '}
            active categories
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(17,19,21,0.03),0_8px_20px_-14px_rgba(17,19,21,0.08)] dark:border-white/[0.08] dark:bg-[#111418]">
          <div className="text-xs font-medium text-stone-500 dark:text-stone-400">
            Remaining Allowance
          </div>
          <div
            className={`font-mono-num mt-2 text-2xl font-semibold ${
              totals.remaining >= 0
                ? 'text-[#0B4F44] dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatCurrency(totals.remaining, currency)}
          </div>
          <div className="mt-2 text-xs text-stone-500 dark:text-stone-400">
            {totals.remaining >= 0 ? 'Available headroom' : 'Exceeded cap'}
          </div>
        </div>
      </div>

      {/* Add / Update Budget Form */}
      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-[0_1px_2px_rgba(17,19,21,0.03),0_10px_24px_-14px_rgba(17,19,21,0.08)] dark:border-white/[0.08] dark:bg-[#111418]"
      >
        <div className="border-b border-stone-200/70 pb-3 dark:border-white/[0.07]">
          <h2 className="font-editorial text-base font-medium text-stone-900 dark:text-white">
            Set Category Monthly Limit
          </h2>
          <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
            Configure or update a spending cap for any expense category
          </p>
        </div>

        {error && (
          <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-12">
          <div className="sm:col-span-5">
            <label htmlFor="budget-category" className="sr-only">
              Category
            </label>
            <select
              id="budget-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-10 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-900 focus:border-[#0B4F44] focus:outline-none dark:border-white/[0.12] dark:bg-[#0A0C0E] dark:text-stone-100 dark:focus:border-[#D4A853]"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4">
            <label htmlFor="budget-limit" className="sr-only">
              Monthly Limit
            </label>
            <input
              id="budget-limit"
              type="number"
              min="1"
              step="10"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="Monthly limit"
              className="font-mono-num h-10 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-900 focus:border-[#0B4F44] focus:outline-none dark:border-white/[0.12] dark:bg-[#0A0C0E] dark:text-stone-100 dark:focus:border-[#D4A853]"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#0B4F44] px-4 text-sm font-medium text-white shadow-[0_4px_12px_-4px_rgba(11,79,68,0.45)] transition-colors hover:bg-[#083D34] disabled:opacity-60 dark:bg-[#D4A853] dark:text-[#0A0C0E] dark:hover:bg-[#E0B96B] whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Limit'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Budget Rows */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[0_1px_2px_rgba(17,19,21,0.03),0_10px_24px_-14px_rgba(17,19,21,0.08)] dark:border-white/[0.08] dark:bg-[#111418]">
        {budgets.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-stone-500 dark:text-stone-400">
            No category budgets added yet. Use the form above to set your first
            monthly spending limit.
          </div>
        ) : (
          <div className="divide-y divide-stone-200/75 dark:divide-white/[0.06]">
            {budgets.map((b) => {
              const clamped = Math.min(100, Math.max(0, b.percentUsed));
              const barClass =
                b.status === 'exceeded'
                  ? 'bg-red-600 dark:bg-red-500'
                  : b.status === 'warning'
                    ? 'bg-[#B4833E] dark:bg-[#D4A853]'
                    : 'bg-[#0B4F44] dark:bg-emerald-500';
              const statusLabel =
                b.status === 'exceeded'
                  ? 'Over budget'
                  : b.status === 'warning'
                    ? 'Approaching limit'
                    : 'Nominal';

              return (
                <div
                  key={b._id}
                  className="p-5 transition-colors hover:bg-[#FAF9F6] dark:hover:bg-white/[0.02]"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3.5">
                      <CategoryIcon category={b.category} />
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-semibold text-stone-900 dark:text-white">
                            {b.category}
                          </span>
                          <span
                            aria-hidden="true"
                            className="text-stone-300 dark:text-stone-700"
                          >
                            ·
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              b.status === 'exceeded'
                                ? 'text-red-600 dark:text-red-400'
                                : b.status === 'warning'
                                  ? 'text-[#B4833E] dark:text-[#D4A853]'
                                  : 'text-[#0B4F44] dark:text-emerald-400'
                            }`}
                          >
                            {statusLabel}
                          </span>
                        </div>
                        <div className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                          <span className="font-mono-num">
                            {formatCurrency(b.spent, currency)}
                          </span>{' '}
                          spent of{' '}
                          <span className="font-mono-num">
                            {formatCurrency(b.limit, currency)}
                          </span>{' '}
                          cap ({b.percentUsed.toFixed(0)}%)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {editingCategory === b.category ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={editingLimit}
                            onChange={(e) => setEditingLimit(e.target.value)}
                            className="font-mono-num h-8 w-28 rounded-lg border border-stone-300 bg-white px-2.5 text-xs text-stone-900 dark:border-white/[0.12] dark:bg-[#0A0C0E] dark:text-stone-100"
                          />
                          <button
                            type="button"
                            onClick={() => handleInlineUpdate(b.category)}
                            className="rounded-lg bg-[#0B4F44] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#083D34] dark:bg-[#D4A853] dark:text-[#0A0C0E]"
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCategory(null)}
                            className="text-xs text-stone-500 hover:underline dark:text-stone-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <span
                            className={`font-mono-num mr-2 text-sm font-semibold ${
                              b.remaining >= 0
                                ? 'text-stone-800 dark:text-stone-200'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {b.remaining >= 0
                              ? `${formatCurrency(b.remaining, currency)} left`
                              : `${formatCurrency(Math.abs(b.remaining), currency)} over`}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategory(b.category);
                              setEditingLimit(String(b.limit));
                            }}
                            aria-label={`Edit ${b.category} limit`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeBudget(b._id)}
                            aria-label={`Delete ${b.category} budget`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-red-50 hover:text-red-600 dark:text-stone-400 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-white/[0.06]">
                    <div
                      className={`h-full rounded-full transition-all ${barClass}`}
                      style={{ width: `${clamped}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
