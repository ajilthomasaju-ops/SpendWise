import { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  Download,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useExpenses } from '../../context/ExpenseContext';
import { transactionsApi } from '../../services/api';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
} from '../../types/finance';
import {
  formatCurrency,
  formatDateLabel,
  formatMonthLabel,
} from '../../utils/formatters';
import { CategoryIcon } from '../Common/CategoryIcon';

export function TransactionsView({
  onAddTransaction,
  onEditTransaction,
}) {
  const { user } = useAuth();
  const { transactions, selectedMonth, removeTransaction } = useExpenses();

  const currency = user?.currency || 'USD';

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [scope, setScope] = useState('month');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [deletingId, setDeletingId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const allCategories = useMemo(
    () => Array.from(new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])),
    []
  );

  const filtered = useMemo(() => {
    let rows = [...transactions];
    if (scope === 'month') {
      rows = rows.filter((t) => t.date.startsWith(selectedMonth));
    }
    if (typeFilter !== 'all') {
      rows = rows.filter((t) => t.type === typeFilter);
    }
    if (categoryFilter !== 'all') {
      rows = rows.filter((t) => t.category === categoryFilter);
    }
    if (paymentFilter !== 'all') {
      rows = rows.filter((t) => t.paymentMethod === paymentFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q) ||
          t.paymentMethod.toLowerCase().includes(q)
      );
    }

    const dir = sortOrder === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      if (sortBy === 'amount') return (a.amount - b.amount) * dir;
      if (sortBy === 'title') return a.title.localeCompare(b.title) * dir;
      if (sortBy === 'category')
        return a.category.localeCompare(b.category) * dir;
      return a.date.localeCompare(b.date) * dir;
    });

    return rows;
  }, [
    transactions,
    scope,
    selectedMonth,
    typeFilter,
    categoryFilter,
    paymentFilter,
    search,
    sortBy,
    sortOrder,
  ]);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const tx of filtered) {
      if (tx.type === 'income') income += tx.amount;
      else expense += tx.amount;
    }
    return { income, expense, net: income - expense };
  }, [filtered]);

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const params = {};
      if (scope === 'month') params.month = selectedMonth;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (search.trim()) params.search = search.trim();
      await transactionsApi.downloadCsv(params);
    } finally {
      setExporting(false);
    }
  };

  const confirmDelete = async (id) => {
    await removeTransaction(id);
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[#9A6B29] uppercase dark:text-[#D4A853]">
            Financial Ledger
          </p>
          <h1 className="font-editorial mt-1 text-3xl font-medium tracking-tight text-stone-900 dark:text-stone-100">
            Transaction Ledger
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Search, filter, edit, and export your financial records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exporting || filtered.length === 0}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 text-sm font-medium text-stone-700 shadow-[0_1px_2px_rgba(17,19,21,0.04)] transition-colors hover:bg-stone-50 disabled:opacity-50 dark:border-white/[0.12] dark:bg-[#111418] dark:text-stone-200 dark:hover:bg-white/[0.06] whitespace-nowrap"
          >
            <Download className="h-4 w-4" />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          <button
            type="button"
            onClick={onAddTransaction}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0B4F44] px-4 text-sm font-medium text-white shadow-[0_4px_12px_-4px_rgba(11,79,68,0.45)] transition-colors hover:bg-[#083D34] dark:bg-[#D4A853] dark:text-[#0A0C0E] dark:shadow-[0_4px_14px_-4px_rgba(212,168,83,0.35)] dark:hover:bg-[#E0B96B] whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>New Entry</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(17,19,21,0.03),0_10px_24px_-14px_rgba(17,19,21,0.08)] dark:border-white/[0.08] dark:bg-[#111418]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-4">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search merchant, category, notes..."
              aria-label="Search transactions"
              className="h-10 w-full rounded-xl border border-stone-300 bg-white pr-3 pl-9 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#0B4F44] focus:outline-none dark:border-white/[0.12] dark:bg-[#0A0C0E] dark:text-stone-100 dark:focus:border-[#D4A853]"
            />
          </div>

          <div className="flex items-center rounded-xl bg-stone-100 p-1 md:col-span-3 dark:bg-white/[0.05]">
            {['all', 'expense', 'income'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`flex-1 rounded-lg px-2.5 py-1.5 text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                  typeFilter === t
                    ? 'bg-white text-stone-900 shadow-xs dark:bg-[#1A1F25] dark:text-white'
                    : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
                }`}
              >
                {t === 'all' ? 'All' : t === 'expense' ? 'Expenses' : 'Income'}
              </button>
            ))}
          </div>

          <div className="md:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
              className="h-10 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-900 focus:border-[#0B4F44] focus:outline-none dark:border-white/[0.12] dark:bg-[#0A0C0E] dark:text-stone-100 dark:focus:border-[#D4A853]"
            >
              <option value="all">All Categories</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              aria-label="Filter by payment method"
              className="h-10 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-900 focus:border-[#0B4F44] focus:outline-none dark:border-white/[0.12] dark:bg-[#0A0C0E] dark:text-stone-100 dark:focus:border-[#D4A853]"
            >
              <option value="all">All Methods</option>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center rounded-xl bg-stone-100 p-1 md:col-span-1 dark:bg-white/[0.05]">
            <button
              type="button"
              onClick={() =>
                setScope((prev) => (prev === 'month' ? 'all' : 'month'))
              }
              title="Toggle selected month vs all time"
              className="w-full rounded-lg bg-white px-2 py-1.5 text-xs font-medium text-stone-800 shadow-xs dark:bg-[#1A1F25] dark:text-stone-200 whitespace-nowrap"
            >
              {scope === 'month' ? 'Month' : 'All'}
            </button>
          </div>
        </div>

        {/* Summary strip */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200/80 pt-3.5 text-xs text-stone-600 dark:border-white/[0.08] dark:text-stone-400">
          <div>
            Showing{' '}
            <span className="font-mono-num font-semibold text-stone-900 dark:text-white">
              {filtered.length}
            </span>{' '}
            entries{' '}
            {scope === 'month'
              ? `in ${formatMonthLabel(selectedMonth)}`
              : 'across all months'}
          </div>
          <div className="flex flex-wrap items-center divide-x divide-stone-200/80 dark:divide-white/[0.08]">
            <span className="pr-4">
              Inflow:{' '}
              <span className="font-mono-num font-semibold text-[#0B4F44] dark:text-emerald-400">
                {formatCurrency(totals.income, currency)}
              </span>
            </span>
            <span className="px-4">
              Outflow:{' '}
              <span className="font-mono-num font-semibold text-stone-900 dark:text-white">
                {formatCurrency(totals.expense, currency)}
              </span>
            </span>
            <span className="pl-4">
              Net:{' '}
              <span
                className={`font-mono-num font-semibold ${
                  totals.net >= 0
                    ? 'text-[#0B4F44] dark:text-[#D4A853]'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {formatCurrency(totals.net, currency)}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* High-density ledger table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[0_1px_2px_rgba(17,19,21,0.03),0_10px_24px_-14px_rgba(17,19,21,0.08)] dark:border-white/[0.08] dark:bg-[#111418]">
        {filtered.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
              No matching transactions found
            </p>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              Adjust your search filters or record a new expense entry.
            </p>
            <button
              type="button"
              onClick={onAddTransaction}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0B4F44] px-4 py-2 text-xs font-medium text-white hover:bg-[#083D34] dark:bg-[#D4A853] dark:text-[#0A0C0E]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Entry</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200/80 bg-[#FAF9F6] text-[11px] font-semibold tracking-[0.08em] text-stone-500 uppercase dark:border-white/[0.08] dark:bg-[#0D1014] dark:text-stone-400">
                  <th className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => toggleSort('date')}
                      className="inline-flex items-center gap-1 hover:text-stone-900 dark:hover:text-white"
                    >
                      <span>Date</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => toggleSort('title')}
                      className="inline-flex items-center gap-1 hover:text-stone-900 dark:hover:text-white"
                    >
                      <span>Title / Notes</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => toggleSort('category')}
                      className="inline-flex items-center gap-1 hover:text-stone-900 dark:hover:text-white"
                    >
                      <span>Category</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="hidden px-5 py-3.5 md:table-cell">Method</th>
                  <th className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort('amount')}
                      className="inline-flex items-center gap-1 hover:text-stone-900 dark:hover:text-white"
                    >
                      <span>Amount</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/75 dark:divide-white/[0.06]">
                {filtered.map((tx) => (
                  <tr
                    key={tx._id}
                    className="transition-colors hover:bg-[#FAF9F6] dark:hover:bg-white/[0.03]"
                  >
                    <td className="font-mono-num px-5 py-3.5 text-xs text-stone-600 dark:text-stone-400 whitespace-nowrap">
                      {formatDateLabel(tx.date)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <CategoryIcon category={tx.category} size="sm" />
                        <div className="min-w-0">
                          <div className="font-medium text-stone-900 dark:text-stone-100">
                            {tx.title}
                          </div>
                          {(tx.notes || tx.recurring) && (
                            <div className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                              {tx.recurring ? 'Recurring' : ''}
                              {tx.recurring && tx.notes ? ' · ' : ''}
                              {tx.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-stone-700 dark:text-stone-300 whitespace-nowrap">
                      {tx.category}
                    </td>
                    <td className="hidden px-4 py-3.5 text-stone-600 md:table-cell dark:text-stone-400 whitespace-nowrap">
                      {tx.paymentMethod}
                    </td>
                    <td
                      className={`font-mono-num px-4 py-3.5 text-right font-semibold whitespace-nowrap ${
                        tx.type === 'income'
                          ? 'text-[#0B4F44] dark:text-emerald-400'
                          : 'text-stone-900 dark:text-stone-100'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount, currency)}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      {deletingId === tx._id ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => confirmDelete(tx._id)}
                            className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(null)}
                            className="text-xs text-stone-500 hover:underline dark:text-stone-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEditTransaction(tx)}
                            aria-label={`Edit ${tx.title}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(tx._id)}
                            aria-label={`Delete ${tx.title}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-red-50 hover:text-red-600 dark:text-stone-400 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
