import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import {
  CURRENCY_CONFIG,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
} from '../../types/finance';

export function TransactionModal({
  isOpen,
  onClose,
  editingTransaction,
  defaultType = 'expense',
  currency,
}) {
  const { addTransaction, editTransaction } = useExpenses();

  const [type, setType] = useState(defaultType);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [notes, setNotes] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setFormError(null);
    if (editingTransaction) {
      setType(editingTransaction.type);
      setTitle(editingTransaction.title);
      setAmount(String(editingTransaction.amount));
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod);
      setNotes(editingTransaction.notes || '');
      setRecurring(Boolean(editingTransaction.recurring));
    } else {
      setType(defaultType);
      setTitle('');
      setAmount('');
      setCategory(
        defaultType === 'income'
          ? INCOME_CATEGORIES[0]
          : EXPENSE_CATEGORIES[0]
      );
      setDate(new Date().toISOString().slice(0, 10));
      setPaymentMethod('Credit Card');
      setNotes('');
      setRecurring(false);
    }
  }, [isOpen, editingTransaction, defaultType]);

  if (!isOpen) return null;

  const categories =
    type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeSwitch = (nextType) => {
    setType(nextType);
    const list = nextType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (!list.includes(category)) {
      setCategory(list[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Please enter a title or merchant name.');
      return;
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFormError('Please enter an amount greater than zero.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        amount: numericAmount,
        type,
        category,
        date,
        paymentMethod,
        notes: notes.trim(),
        recurring,
      };
      if (editingTransaction) {
        await editTransaction(editingTransaction._id, payload);
      } else {
        await addTransaction(payload);
      }
      onClose();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Unable to save transaction.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const currencySymbol = CURRENCY_CONFIG[currency]?.symbol || '$';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-modal-title"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-white/[0.1] dark:bg-[#111418]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#0B4F44] via-[#B4833E] to-[#0B4F44] opacity-85 dark:from-[#0B4F44] dark:via-[#D4A853] dark:to-[#0B4F44]" />
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-4 dark:border-white/[0.08]">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-[#9A6B29] uppercase dark:text-[#D4A853]">
              Ledger Entry
            </p>
            <h2
              id="transaction-modal-title"
              className="font-editorial mt-0.5 text-xl font-semibold text-stone-900 dark:text-stone-100"
            >
              {editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
            </h2>
            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
              {editingTransaction
                ? 'Update details in your personal ledger'
                : 'Log a new expense or income entry'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/[0.06] dark:hover:text-stone-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-stone-100 p-1 dark:bg-white/[0.05]">
            <button
              type="button"
              onClick={() => handleTypeSwitch('expense')}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                type === 'expense'
                  ? 'bg-white text-stone-900 shadow-xs dark:bg-[#1A1F25] dark:text-white'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeSwitch('income')}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                type === 'income'
                  ? 'bg-white text-stone-900 shadow-xs dark:bg-[#1A1F25] dark:text-white'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
              }`}
            >
              Income
            </button>
          </div>

          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
              {formError}
            </div>
          )}

          <div>
            <label
              htmlFor="tx-title"
              className="mb-1.5 block text-xs font-medium tracking-wide text-stone-600 dark:text-stone-400"
            >
              Title / Merchant
            </label>
            <input
              id="tx-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === 'expense'
                  ? 'e.g., Whole Foods Market'
                  : 'e.g., Monthly Salary'
              }
              required
              className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#0B4F44] focus:ring-2 focus:ring-[#0B4F44]/15 focus:outline-none dark:border-white/[0.12] dark:bg-[#0A0C0E] dark:text-stone-100 dark:focus:border-[#D4A853]"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="tx-amount"
                className="mb-1.5 block text-xs font-medium tracking-wide text-stone-600 dark:text-stone-400"
              >
                Amount ({currency})
              </label>
              <div className="relative">
                <span className="font-mono-num pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-stone-500 dark:text-stone-400">
                  {currencySymbol}
                </span>
                <input
                  id="tx-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="font-mono-num w-full rounded-xl border border-stone-300 bg-white py-2.5 pr-3.5 pl-9 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#0B4F44] focus:ring-2 focus:ring-[#0B4F44]/15 focus:outline-none dark:border-white/[0.12] dark:bg-[#0A0C0E] dark:text-stone-100 dark:focus:border-[#D4A853]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="tx-date"
                className="mb-1.5 block text-xs font-medium tracking-wide text-stone-600 dark:text-stone-400"
              >
                Date
              </label>
              <input
                id="tx-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="font-mono-num w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-[#0B4F44] focus:ring-2 focus:ring-[#0B4F44]/15 focus:outline-none dark:border-white/[0.12] dark:bg-[#0A0C0E] dark:text-stone-100 dark:focus:border-[#D4A853]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="tx-category"
                className="mb-1.5 block text-xs font-medium tracking-wide text-stone-600 dark:text-stone-400"
              >
                Category
              </label>
              <select
                id="tx-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-[#0B4F44] focus:ring-2 focus:ring-[#0B4F44]/15 focus:outline-none dark:border-white/[0.12] dark:bg-[#0A0C0E] dark:text-stone-100 dark:focus:border-[#D4A853]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="tx-method"
                className="mb-1.5 block text-xs font-medium tracking-wide text-stone-600 dark:text-stone-400"
              >
                Payment Method
              </label>
              <select
                id="tx-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-[#0B4F44] focus:ring-2 focus:ring-[#0B4F44]/15 focus:outline-none dark:border-white/[0.12] dark:bg-[#0A0C0E] dark:text-stone-100 dark:focus:border-[#D4A853]"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="tx-notes"
              className="mb-1.5 block text-xs font-medium tracking-wide text-stone-600 dark:text-stone-400"
            >
              Notes (optional)
            </label>
            <textarea
              id="tx-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add receipt memo or context..."
              className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#0B4F44] focus:ring-2 focus:ring-[#0B4F44]/15 focus:outline-none dark:border-white/[0.12] dark:bg-[#0A0C0E] dark:text-stone-100 dark:focus:border-[#D4A853]"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-stone-700 dark:text-stone-300">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-[#0B4F44] focus:ring-[#0B4F44] dark:border-white/20 dark:bg-[#0A0C0E]"
            />
            <span>Mark as recurring monthly entry</span>
          </label>

          <div className="flex items-center justify-end gap-3 border-t border-stone-200/80 pt-4 dark:border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:border-white/[0.12] dark:bg-white/[0.04] dark:text-stone-300 dark:hover:bg-white/[0.08] whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#0B4F44] px-5 py-2 text-sm font-medium text-white shadow-xs transition-colors hover:bg-[#083D34] disabled:opacity-60 dark:bg-[#D4A853] dark:text-[#0A0C0E] dark:hover:bg-[#E0B96B] whitespace-nowrap"
            >
              {submitting
                ? 'Saving...'
                : editingTransaction
                  ? 'Save Changes'
                  : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
