import { ArcElement, Chart as ChartJS, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import {
  CATEGORY_CHART_PALETTE,
  formatCurrency,
} from '../../utils/formatters';

ChartJS.register(ArcElement, Tooltip);

export function CategoryDoughnutChart({ transactions, currency }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalsMap = new Map();
  for (const tx of expenses) {
    totalsMap.set(tx.category, (totalsMap.get(tx.category) || 0) + tx.amount);
  }

  const sorted = Array.from(totalsMap.entries()).sort((a, b) => b[1] - a[1]);
  const totalSpent = sorted.reduce((sum, [, val]) => sum + val, 0);

  if (sorted.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-stone-500 dark:text-stone-400">
        No expenses recorded for this month yet.
      </div>
    );
  }

  const data = {
    labels: sorted.map(([cat]) => cat),
    datasets: [
      {
        data: sorted.map(([, amt]) => Math.round(amt * 100) / 100),
        backgroundColor: sorted.map(
          (_, idx) => CATEGORY_CHART_PALETTE[idx % CATEGORY_CHART_PALETTE.length]
        ),
        borderColor: isDark ? '#111418' : '#FFFFFF',
        borderWidth: 2,
        spacing: 2,
        borderRadius: 4,
        hoverOffset: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0E1318',
        titleColor: '#FAF9F6',
        bodyColor: '#E7E5E4',
        borderColor: 'rgba(212,168,83,0.3)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: { family: '"Plus Jakarta Sans", sans-serif', size: 12 },
        bodyFont: { family: '"JetBrains Mono", monospace', size: 12 },
        callbacks: {
          label: (ctx) => {
            const val = Number(ctx.parsed || 0);
            const pct = totalSpent > 0 ? ((val / totalSpent) * 100).toFixed(1) : '0';
            return ` ${formatCurrency(val, currency)} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-12">
      <div className="relative mx-auto h-[215px] w-[215px] sm:col-span-5">
        <Doughnut data={data} options={options} />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
            Total Outflow
          </span>
          <span className="font-mono-num mt-0.5 text-lg font-semibold text-stone-900 dark:text-stone-100">
            {formatCurrency(totalSpent, currency, totalSpent >= 10000)}
          </span>
        </div>
      </div>

      <div className="space-y-3 sm:col-span-7">
        {sorted.slice(0, 5).map(([category, amount], idx) => {
          const pct = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
          const color =
            CATEGORY_CHART_PALETTE[idx % CATEGORY_CHART_PALETTE.length];
          return (
            <div key={category} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                  <span className="truncate font-medium text-stone-700 dark:text-stone-300">
                    {category}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2.5">
                  <span className="font-mono-num text-stone-500 dark:text-stone-400">
                    {pct.toFixed(0)}%
                  </span>
                  <span className="font-mono-num w-20 text-right font-semibold text-stone-900 dark:text-stone-100">
                    {formatCurrency(amount, currency)}
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-white/[0.06]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
        {sorted.length > 5 && (
          <p className="pt-0.5 text-xs text-stone-500 dark:text-stone-400">
            +{sorted.length - 5} additional categories
          </p>
        )}
      </div>
    </div>
  );
}
