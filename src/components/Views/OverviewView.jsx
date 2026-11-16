import {
  ArrowDownRight,
  ArrowUpRight,
  Pencil,
  PiggyBank,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useExpenses } from '../../context/ExpenseContext';
import {
  formatCurrency,
  formatDateLabel,
  formatMonthLabel,
  shiftMonthKey,
} from '../../utils/formatters';
import { CashflowBarChart } from '../Charts/CashflowBarChart';
import { CategoryDoughnutChart } from '../Charts/CategoryDoughnutChart';
import { CategoryIcon } from '../Common/CategoryIcon';

export function OverviewView({
  onNavigate,
  onAddTransaction,
  onEditTransaction,
}) {
  const { user } = useAuth();
  const {
    transactions,
    monthTransactions,
    budgets,
    selectedMonth,
    loading,
    removeTransaction,
  } = useExpenses();

  const currency = user?.currency || 'USD';
  const prevMonthKey = shiftMonthKey(selectedMonth, -1);

  const metrics = useMemo(() => {
    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const net = income - expenses;
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    const prevExpenses = transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(prevMonthKey))
      .reduce((sum, t) => sum + t.amount, 0);
    const expenseDeltaPct =
      prevExpenses > 0
        ? ((expenses - prevExpenses) / prevExpenses) * 100
        : null;

    const incomeGoal = user?.monthlyIncomeGoal || 0;
    const incomeGoalPct =
      incomeGoal > 0 ? Math.min(100, (income / incomeGoal) * 100) : 0;

    const expenseRatio =
      income > 0 ? Math.min(100, (expenses / income) * 100) : 0;

    return {
      income,
      expenses,
      net,
      savingsRate,
      expenseDeltaPct,
      incomeGoalPct,
      expenseRatio,
    };
  }, [
    monthTransactions,
    transactions,
    prevMonthKey,
    user?.monthlyIncomeGoal,
  ]);

  const recentEntries = useMemo(
    () => monthTransactions.slice(0, 6),
    [monthTransactions]
  );

  if (loading && transactions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="h-44 animate-pulse rounded-2xl bg-stone-200 lg:col-span-5 dark:bg-[#111418]" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-7">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className="h-44 animate-pulse rounded-2xl border border-stone-200 bg-white dark:border-white/[0.08] dark:bg-[#111418]"
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="h-80 animate-pulse rounded-2xl border border-stone-200 bg-white lg:col-span-7 dark:border-white/[0.08] dark:bg-[#111418]" />
          <div className="h-80 animate-pulse rounded-2xl border border-stone-200 bg-white lg:col-span-5 dark:border-white/[0.08] dark:bg-[#111418]" />
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200/90 bg-white px-6 py-16 text-center shadow-[0_8px_24px_-12px_rgba(17,19,21,0.08)] dark:border-white/[0.08] dark:bg-[#111418]">
        <h2 className="font-editorial text-2xl font-semibold text-stone-900 dark:text-white">
          Your personal ledger is ready
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-stone-600 dark:text-stone-400">
          Log your first expense or income entry to unlock monthly cashflow
          charts, category allocations, and budget tracking.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onAddTransaction}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0B4F44] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#083D34] dark:bg-[#D4A853] dark:text-[#0A0C0E] dark:hover:bg-[#E0B96B]"
          >
            <Plus className="h-4 w-4" />
            <span>Log First Entry</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('budgets')}
            className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:border-white/[0.12] dark:bg-white/[0.04] dark:text-stone-200 dark:hover:bg-white/[0.08]"
          >
            Set Monthly Budgets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[#9A6B29] uppercase dark:text-[#D4A853]">
            Executive Summary
          </p>
          <h1 className="font-editorial mt-1 text-3xl font-medium tracking-tight text-stone-900 dark:text-stone-100">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Private ledger overview for {formatMonthLabel(selectedMonth)} ·{' '}
            <span className="font-mono-num">{monthTransactions.length}</span>{' '}
            entries recorded
          </p>
        </div>
      </div>

      {/* Asymmetric Private Wealth Hero Balance + 3 Supporting KPIs */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Dominant Net Cashflow Anchor */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#D4A853]/30 bg-gradient-to-br from-[#0D1216] via-[#121A1F] to-[#0B4F44]/95 p-6 text-white shadow-[0_18px_40px_-18px_rgba(11,79,68,0.5)] lg:col-span-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4A853] to-transparent opacity-80" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#D4A853]/14 blur-2xl"
          />

          <div className="relative">
            <div className="flex items-center justify-between text-xs text-stone-300">
              <span className="tracking-wide">
                Net Cashflow · {formatMonthLabel(selectedMonth)}
              </span>
              <span className="font-mono-num text-[11px] font-semibold tracking-[0.12em] text-[#E6C37A] uppercase">
                {metrics.net >= 0 ? 'Surplus' : 'Deficit'}
              </span>
            </div>
            <div
              className={`font-mono-num mt-3 text-3xl font-semibold tracking-tight sm:text-4xl ${
                metrics.net >= 0 ? 'text-white' : 'text-rose-300'
              }`}
            >
              {formatCurrency(metrics.net, currency)}
            </div>
          </div>

          <div className="relative mt-7 space-y-2.5 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between text-xs text-stone-300">
              <span>Expense-to-Income Ratio</span>
              <span className="font-mono-num font-medium text-white">
                {metrics.expenseRatio.toFixed(0)}% used
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-all ${
                  metrics.expenseRatio > 95
                    ? 'bg-rose-400'
                    : metrics.expenseRatio > 80
                      ? 'bg-[#D4A853]'
                      : 'bg-emerald-400'
                }`}
                style={{ width: `${metrics.expenseRatio}%` }}
              />
            </div>
            <div className="flex items-center justify-between pt-1 text-xs text-stone-300">
              <span>
                Inflow:{' '}
                <span className="font-mono-num font-medium text-emerald-300">
                  {formatCurrency(metrics.income, currency, true)}
                </span>
              </span>
              <span>
                Outflow:{' '}
                <span className="font-mono-num font-medium text-[#E6C37A]">
                  {formatCurrency(metrics.expenses, currency, true)}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* 3 Supporting KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-7">
          <div className="flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(17,19,21,0.03),0_8px_20px_-14px_rgba(17,19,21,0.08)] transition-colors hover:border-stone-300/90 dark:border-white/[0.08] dark:bg-[#111418] dark:hover:border-white/[0.14]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                Monthly Income
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-[#0B4F44] ring-1 ring-[#0B4F44]/10 dark:bg-emerald-950/60 dark:text-emerald-400 dark:ring-emerald-400/15">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="font-mono-num text-2xl font-semibold tracking-tight text-stone-900 dark:text-white">
                {formatCurrency(metrics.income, currency)}
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-[#0B4F44] dark:bg-emerald-500"
                  style={{ width: `${metrics.incomeGoalPct}%` }}
                />
              </div>
              <div className="mt-2.5 flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                <ArrowUpRight className="h-3.5 w-3.5 text-[#0B4F44] dark:text-emerald-400" />
                <span>
                  Target:{' '}
                  <span className="font-mono-num">
                    {formatCurrency(user?.monthlyIncomeGoal || 0, currency, true)}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(17,19,21,0.03),0_8px_20px_-14px_rgba(17,19,21,0.08)] transition-colors hover:border-stone-300/90 dark:border-white/[0.08] dark:bg-[#111418] dark:hover:border-white/[0.14]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                Monthly Expenses
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50/90 text-[#B4833E] ring-1 ring-[#B4833E]/15 dark:bg-[#D4A853]/15 dark:text-[#D4A853] dark:ring-[#D4A853]/20">
                <TrendingDown className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="font-mono-num text-2xl font-semibold tracking-tight text-stone-900 dark:text-white">
                {formatCurrency(metrics.expenses, currency)}
              </div>
              <div className="mt-3 flex items-center gap-1 border-t border-stone-100 pt-2.5 text-xs text-stone-500 dark:border-white/[0.06] dark:text-stone-400">
                <ArrowDownRight className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />
                {metrics.expenseDeltaPct === null ? (
                  <span>No prior month baseline</span>
                ) : (
                  <span>
                    <span className="font-mono-num font-medium text-stone-700 dark:text-stone-300">
                      {metrics.expenseDeltaPct >= 0 ? '+' : ''}
                      {metrics.expenseDeltaPct.toFixed(1)}%
                    </span>{' '}
                    vs prior month
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(17,19,21,0.03),0_8px_20px_-14px_rgba(17,19,21,0.08)] transition-colors hover:border-stone-300/90 dark:border-white/[0.08] dark:bg-[#111418] dark:hover:border-white/[0.14]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                Savings Rate
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-800 ring-1 ring-stone-200/80 dark:bg-white/[0.07] dark:text-[#D4A853] dark:ring-white/[0.08]">
                <PiggyBank className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="font-mono-num text-2xl font-semibold tracking-tight text-stone-900 dark:text-white">
                {metrics.savingsRate.toFixed(1)}%
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-[#B4833E] dark:bg-[#D4A853]"
                  style={{
                    width: `${Math.min(100, Math.max(0, metrics.savingsRate))}%`,
                  }}
                />
              </div>
              <div className="mt-2.5 text-xs text-stone-500 dark:text-stone-400">
                {metrics.savingsRate >= 20
                  ? 'Healthy retention pace'
                  : metrics.income === 0
                    ? 'Log income to measure'
                    : 'Target: 20%+ monthly'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Charts Split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-[0_1px_2px_rgba(17,19,21,0.03),0_10px_24px_-14px_rgba(17,19,21,0.08)] lg:col-span-7 dark:border-white/[0.08] dark:bg-[#111418]">
          <div className="mb-5 flex items-center justify-between border-b border-stone-200/70 pb-4 dark:border-white/[0.07]">
            <div>
              <h2 className="font-editorial text-lg font-medium text-stone-900 dark:text-white">
                6-Month Cashflow
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Monthly income compared against total expenses
              </p>
            </div>
          </div>
          <CashflowBarChart
            transactions={transactions}
            selectedMonth={selectedMonth}
            currency={currency}
          />
        </section>

        <section className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-[0_1px_2px_rgba(17,19,21,0.03),0_10px_24px_-14px_rgba(17,19,21,0.08)] lg:col-span-5 dark:border-white/[0.08] dark:bg-[#111418]">
          <div className="mb-5 flex items-center justify-between border-b border-stone-200/70 pb-4 dark:border-white/[0.07]">
            <div>
              <h2 className="font-editorial text-lg font-medium text-stone-900 dark:text-white">
                Expense Allocation
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Category share for {formatMonthLabel(selectedMonth)}
              </p>
            </div>
          </div>
          <CategoryDoughnutChart
            transactions={monthTransactions}
            currency={currency}
          />
        </section>
      </div>

      {/* Bottom Split: Recent Transactions & Budget Health */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-[0_1px_2px_rgba(17,19,21,0.03),0_10px_24px_-14px_rgba(17,19,21,0.08)] lg:col-span-7 dark:border-white/[0.08] dark:bg-[#111418]">
          <div className="mb-4 flex items-center justify-between border-b border-stone-200/70 pb-4 dark:border-white/[0.07]">
            <div>
              <h2 className="font-editorial text-lg font-medium text-stone-900 dark:text-white">
                Recent Transactions
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Latest entries in {formatMonthLabel(selectedMonth)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('transactions')}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#0B4F44] hover:underline dark:text-[#D4A853] whitespace-nowrap"
            >
              <span>View full ledger</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {recentEntries.length === 0 ? (
            <div className="py-10 text-center text-sm text-stone-500 dark:text-stone-400">
              No transactions logged in {formatMonthLabel(selectedMonth)}.
            </div>
          ) : (
            <div className="divide-y divide-stone-200/70 dark:divide-white/[0.06]">
              {recentEntries.map((tx) => (
                <div
                  key={tx._id}
                  className="group -mx-2.5 flex items-center justify-between gap-4 rounded-xl px-2.5 py-3.5 transition-colors hover:bg-[#FAF9F6] dark:hover:bg-white/[0.03]"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3.5">
                    <CategoryIcon category={tx.category} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-stone-900 dark:text-stone-100">
                        {tx.title}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                        <span>{tx.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-num">
                          {formatDateLabel(tx.date)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{tx.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`font-mono-num text-sm font-semibold ${
                        tx.type === 'income'
                          ? 'text-[#0B4F44] dark:text-emerald-400'
                          : 'text-stone-900 dark:text-stone-100'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount, currency)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditTransaction(tx)}
                        aria-label={`Edit ${tx.title}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-200/60 hover:text-stone-800 dark:hover:bg-white/[0.08] dark:hover:text-stone-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTransaction(tx._id)}
                        aria-label={`Delete ${tx.title}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-[0_1px_2px_rgba(17,19,21,0.03),0_10px_24px_-14px_rgba(17,19,21,0.08)] lg:col-span-5 dark:border-white/[0.08] dark:bg-[#111418]">
          <div className="mb-4 flex items-center justify-between border-b border-stone-200/70 pb-4 dark:border-white/[0.07]">
            <div>
              <h2 className="font-editorial text-lg font-medium text-stone-900 dark:text-white">
                Monthly Budgets
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Spending against category caps
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('budgets')}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#0B4F44] hover:underline dark:text-[#D4A853] whitespace-nowrap"
            >
              <span>Manage budgets</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {budgets.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-stone-500 dark:text-stone-400">
                No category budgets configured yet.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('budgets')}
                className="mt-3 text-xs font-medium text-[#0B4F44] hover:underline dark:text-[#D4A853]"
              >
                Create your first budget cap
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.slice(0, 6).map((b) => {
                const clampedPct = Math.min(100, Math.max(0, b.percentUsed));
                const barColor =
                  b.status === 'exceeded'
                    ? 'bg-red-600 dark:bg-red-500'
                    : b.status === 'warning'
                      ? 'bg-[#B4833E] dark:bg-[#D4A853]'
                      : 'bg-[#0B4F44] dark:bg-emerald-500';
                const statusText =
                  b.status === 'exceeded'
                    ? 'Over budget'
                    : b.status === 'warning'
                      ? 'Approaching limit'
                      : 'Nominal';

                return (
                  <div key={b._id} className="flex items-start gap-3">
                    <CategoryIcon category={b.category} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2 text-sm">
                        <span className="truncate font-medium text-stone-800 dark:text-stone-200">
                          {b.category}
                        </span>
                        <span className="font-mono-num shrink-0 text-xs text-stone-600 dark:text-stone-400">
                          {formatCurrency(b.spent, currency, true)} /{' '}
                          {formatCurrency(b.limit, currency, true)}
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-white/[0.06]">
                        <div
                          className={`h-full rounded-full transition-all ${barColor}`}
                          style={{ width: `${clampedPct}%` }}
                        />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs">
                        <span
                          className={
                            b.status === 'exceeded'
                              ? 'text-red-600 dark:text-red-400'
                              : b.status === 'warning'
                                ? 'text-[#B4833E] dark:text-[#D4A853]'
                                : 'text-stone-500 dark:text-stone-400'
                          }
                        >
                          {statusText}
                        </span>
                        <span className="font-mono-num text-stone-500 dark:text-stone-400">
                          {b.percentUsed.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
