import { useMemo } from 'react';
import { Calendar, CreditCard, Flame, Repeat } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useExpenses } from '../../context/ExpenseContext';
import {
  formatCurrency,
  formatDateLabel,
  formatMonthLabel,
  getRecentMonthKeys,
} from '../../utils/formatters';
import {
  DailySpendLineChart,
  PaymentMethodBarChart,
} from '../Charts/DailySpendLineChart';
import { CategoryIcon } from '../Common/CategoryIcon';

export function AnalyticsView() {
  const { user } = useAuth();
  const { transactions, monthTransactions, selectedMonth } = useExpenses();

  const currency = user?.currency || 'USD';

  const stats = useMemo(() => {
    const recent6 = getRecentMonthKeys(selectedMonth, 6);
    const sixMonthTotals = recent6.map((ym) =>
      transactions
        .filter((t) => t.type === 'expense' && t.date.startsWith(ym))
        .reduce((s, t) => s + t.amount, 0)
    );
    const activeMonths = sixMonthTotals.filter((v) => v > 0);
    const avgMonthlySpend =
      activeMonths.length > 0
        ? activeMonths.reduce((a, b) => a + b, 0) / activeMonths.length
        : 0;

    const monthExpenses = monthTransactions.filter((t) => t.type === 'expense');
    const recurringTotal = monthExpenses
      .filter((t) => t.recurring)
      .reduce((s, t) => s + t.amount, 0);

    const catTotals = new Map();
    for (const tx of monthExpenses) {
      catTotals.set(tx.category, (catTotals.get(tx.category) || 0) + tx.amount);
    }
    const topCategory =
      Array.from(catTotals.entries()).sort((a, b) => b[1] - a[1])[0] || null;

    const largestExpenses = [...monthExpenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const avgTicket =
      monthExpenses.length > 0
        ? monthExpenses.reduce((s, t) => s + t.amount, 0) /
          monthExpenses.length
        : 0;

    return {
      avgMonthlySpend,
      recurringTotal,
      topCategory,
      largestExpenses,
      avgTicket,
    };
  }, [transactions, monthTransactions, selectedMonth]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[#9A6B29] uppercase dark:text-[#D4A853]">
          Cashflow Intelligence
        </p>
        <h1 className="font-editorial mt-1 text-3xl font-medium tracking-tight text-stone-900 dark:text-stone-100">
          Spending Analytics
        </h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Daily velocity, payment channels, and top outflows for{' '}
          {formatMonthLabel(selectedMonth)}
        </p>
      </div>

      {/* 4-column Analytics KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(17,19,21,0.03),0_8px_20px_-14px_rgba(17,19,21,0.08)] transition-colors hover:border-stone-300/90 dark:border-white/[0.08] dark:bg-[#111418] dark:hover:border-white/[0.14]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              6-Month Avg Spend
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-700 ring-1 ring-stone-200/80 dark:bg-white/[0.06] dark:text-stone-300 dark:ring-white/[0.08]">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="font-mono-num mt-3 text-2xl font-semibold text-stone-900 dark:text-white">
            {formatCurrency(stats.avgMonthlySpend, currency)}
          </div>
          <div className="mt-2 text-xs text-stone-500 dark:text-stone-400">
            Rolling active month baseline
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(17,19,21,0.03),0_8px_20px_-14px_rgba(17,19,21,0.08)] transition-colors hover:border-stone-300/90 dark:border-white/[0.08] dark:bg-[#111418] dark:hover:border-white/[0.14]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              Average Transaction
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-[#0B4F44] ring-1 ring-[#0B4F44]/10 dark:bg-emerald-950/60 dark:text-emerald-400 dark:ring-emerald-400/15">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="font-mono-num mt-3 text-2xl font-semibold text-stone-900 dark:text-white">
            {formatCurrency(stats.avgTicket, currency)}
          </div>
          <div className="mt-2 text-xs text-stone-500 dark:text-stone-400">
            Mean ticket in {formatMonthLabel(selectedMonth)}
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(17,19,21,0.03),0_8px_20px_-14px_rgba(17,19,21,0.08)] transition-colors hover:border-stone-300/90 dark:border-white/[0.08] dark:bg-[#111418] dark:hover:border-white/[0.14]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              Recurring Commitments
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-[#B4833E] ring-1 ring-[#B4833E]/15 dark:bg-[#D4A853]/15 dark:text-[#D4A853] dark:ring-[#D4A853]/20">
              <Repeat className="h-4 w-4" />
            </div>
          </div>
          <div className="font-mono-num mt-3 text-2xl font-semibold text-stone-900 dark:text-white">
            {formatCurrency(stats.recurringTotal, currency)}
          </div>
          <div className="mt-2 text-xs text-stone-500 dark:text-stone-400">
            Scheduled monthly outflows
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(17,19,21,0.03),0_8px_20px_-14px_rgba(17,19,21,0.08)] transition-colors hover:border-stone-300/90 dark:border-white/[0.08] dark:bg-[#111418] dark:hover:border-white/[0.14]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              Top Expense Category
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-800 ring-1 ring-stone-200/80 dark:bg-white/[0.06] dark:text-[#D4A853] dark:ring-white/[0.08]">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 truncate text-lg font-semibold text-stone-900 dark:text-white">
            {stats.topCategory ? stats.topCategory[0] : 'None yet'}
          </div>
          {stats.topCategory ? (
            <div className="font-mono-num mt-1 text-xs text-stone-500 dark:text-stone-400">
              {formatCurrency(stats.topCategory[1], currency)}
            </div>
          ) : (
            <div className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              Awaiting entries
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-[0_1px_2px_rgba(17,19,21,0.03),0_10px_24px_-14px_rgba(17,19,21,0.08)] lg:col-span-7 dark:border-white/[0.08] dark:bg-[#111418]">
          <div className="mb-5 border-b border-stone-200/70 pb-4 dark:border-white/[0.07]">
            <h2 className="font-editorial text-lg font-medium text-stone-900 dark:text-white">
              Daily Expense Velocity
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Day-by-day spending across {formatMonthLabel(selectedMonth)}
            </p>
          </div>
          <DailySpendLineChart
            transactions={monthTransactions}
            selectedMonth={selectedMonth}
            currency={currency}
          />
        </section>

        <section className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-[0_1px_2px_rgba(17,19,21,0.03),0_10px_24px_-14px_rgba(17,19,21,0.08)] lg:col-span-5 dark:border-white/[0.08] dark:bg-[#111418]">
          <div className="mb-5 border-b border-stone-200/70 pb-4 dark:border-white/[0.07]">
            <h2 className="font-editorial text-lg font-medium text-stone-900 dark:text-white">
              Payment Channels
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Expenses grouped by payment method
            </p>
          </div>
          <PaymentMethodBarChart
            transactions={monthTransactions}
            currency={currency}
          />
        </section>
      </div>

      {/* Top 5 Single Outflows */}
      <section className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-[0_1px_2px_rgba(17,19,21,0.03),0_10px_24px_-14px_rgba(17,19,21,0.08)] dark:border-white/[0.08] dark:bg-[#111418]">
        <div className="mb-4 border-b border-stone-200/70 pb-4 dark:border-white/[0.07]">
          <h2 className="font-editorial text-lg font-medium text-stone-900 dark:text-white">
            Largest Outflows This Month
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Highest individual expense entries in{' '}
            {formatMonthLabel(selectedMonth)}
          </p>
        </div>

        {stats.largestExpenses.length === 0 ? (
          <p className="py-6 text-sm text-stone-500 dark:text-stone-400">
            No expenses logged for {formatMonthLabel(selectedMonth)}.
          </p>
        ) : (
          <div className="divide-y divide-stone-200/75 dark:divide-white/[0.06]">
            {stats.largestExpenses.map((tx, idx) => (
              <div
                key={tx._id}
                className="-mx-2.5 flex items-center justify-between gap-4 rounded-xl px-2.5 py-3.5 text-sm transition-colors hover:bg-[#FAF9F6] dark:hover:bg-white/[0.03]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="font-mono-num w-6 text-xs font-semibold text-[#9A6B29] dark:text-[#D4A853]">
                    0{idx + 1}.
                  </span>
                  <CategoryIcon category={tx.category} size="sm" />
                  <div className="min-w-0">
                    <div className="truncate font-medium text-stone-900 dark:text-stone-100">
                      {tx.title}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">
                      {tx.category} · {formatDateLabel(tx.date)} ·{' '}
                      {tx.paymentMethod}
                    </div>
                  </div>
                </div>
                <span className="font-mono-num shrink-0 font-semibold text-stone-900 dark:text-stone-100">
                  {formatCurrency(tx.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
