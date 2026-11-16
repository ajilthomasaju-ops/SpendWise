import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip
);

export function DailySpendLineChart({ transactions, selectedMonth, currency }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [yearStr, monthStr] = selectedMonth.split('-');
  const daysInMonth = new Date(Number(yearStr), Number(monthStr), 0).getDate();
  const dayLabels = Array.from({ length: daysInMonth }, (_, i) =>
    String(i + 1)
  );

  const dailyTotals = Array.from({ length: daysInMonth }, (_, i) => {
    const dayKey = `${selectedMonth}-${String(i + 1).padStart(2, '0')}`;
    return transactions
      .filter((t) => t.type === 'expense' && t.date === dayKey)
      .reduce((sum, t) => sum + t.amount, 0);
  });

  const data = {
    labels: dayLabels,
    datasets: [
      {
        label: 'Daily Spend',
        data: dailyTotals,
        borderColor: isDark ? '#D4A853' : '#0B4F44',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return isDark
              ? 'rgba(212, 168, 83, 0.16)'
              : 'rgba(11, 79, 68, 0.12)';
          }
          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          );
          gradient.addColorStop(
            0,
            isDark ? 'rgba(212, 168, 83, 0.28)' : 'rgba(11, 79, 68, 0.22)'
          );
          gradient.addColorStop(1, 'rgba(11, 79, 68, 0.0)');
          return gradient;
        },
        borderWidth: 2.25,
        tension: 0.32,
        fill: true,
        pointRadius: 2.5,
        pointHoverRadius: 5,
        pointBackgroundColor: isDark ? '#D4A853' : '#0B4F44',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
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
        bodyFont: { family: '"JetBrains Mono", monospace', size: 12 },
        callbacks: {
          title: (items) => `Day ${items[0]?.label || ''}`,
          label: (ctx) =>
            ` Spent: ${formatCurrency(Number(ctx.parsed.y || 0), currency)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          maxTicksLimit: 10,
          color: isDark ? '#A8A29E' : '#78716C',
          font: { family: '"JetBrains Mono", monospace', size: 11 },
        },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: {
          color: isDark
            ? 'rgba(255, 255, 255, 0.06)'
            : 'rgba(214, 211, 209, 0.5)',
        },
        ticks: {
          color: isDark ? '#A8A29E' : '#78716C',
          font: { family: '"JetBrains Mono", monospace', size: 11 },
          callback: (val) => formatCurrency(Number(val), currency, true),
        },
      },
    },
  };

  return (
    <div className="h-[270px] w-full">
      <Line data={data} options={options} />
    </div>
  );
}

export function PaymentMethodBarChart({ transactions, currency }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const expenses = transactions.filter((t) => t.type === 'expense');
  const map = new Map();
  for (const tx of expenses) {
    map.set(tx.paymentMethod, (map.get(tx.paymentMethod) || 0) + tx.amount);
  }
  const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return (
      <div className="flex h-[270px] items-center justify-center text-sm text-stone-500 dark:text-stone-400">
        No expense payment method data for this period.
      </div>
    );
  }

  const data = {
    labels: entries.map(([method]) => method),
    datasets: [
      {
        label: 'Spend by Method',
        data: entries.map(([, val]) => Math.round(val * 100) / 100),
        backgroundColor: isDark ? '#10B981' : '#0B4F44',
        borderRadius: 6,
        barThickness: 22,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0E1318',
        borderColor: 'rgba(212,168,83,0.3)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        bodyFont: { family: '"JetBrains Mono", monospace', size: 12 },
        callbacks: {
          label: (ctx) =>
            ` ${formatCurrency(Number(ctx.parsed.x || 0), currency)}`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        border: { display: false },
        grid: {
          color: isDark
            ? 'rgba(255, 255, 255, 0.06)'
            : 'rgba(214, 211, 209, 0.5)',
        },
        ticks: {
          color: isDark ? '#A8A29E' : '#78716C',
          font: { family: '"JetBrains Mono", monospace', size: 11 },
          callback: (val) => formatCurrency(Number(val), currency, true),
        },
      },
      y: {
        border: { display: false },
        grid: { display: false },
        ticks: {
          color: isDark ? '#E7E5E4' : '#292524',
          font: {
            family: '"Plus Jakarta Sans", sans-serif',
            size: 12,
            weight: 500,
          },
        },
      },
    },
  };

  return (
    <div className="h-[270px] w-full">
      <Bar data={data} options={options} />
    </div>
  );
}
