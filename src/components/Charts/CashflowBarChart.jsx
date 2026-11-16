import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import {
  formatCurrency,
  formatShortMonthLabel,
  getRecentMonthKeys,
} from '../../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export function CashflowBarChart({ transactions, selectedMonth, currency }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const monthKeys = getRecentMonthKeys(selectedMonth, 6);
  const incomeSeries = monthKeys.map((ym) =>
    transactions
      .filter((t) => t.type === 'income' && t.date.startsWith(ym))
      .reduce((acc, t) => acc + t.amount, 0)
  );
  const expenseSeries = monthKeys.map((ym) =>
    transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(ym))
      .reduce((acc, t) => acc + t.amount, 0)
  );

  const data = {
    labels: monthKeys.map(formatShortMonthLabel),
    datasets: [
      {
        label: 'Income',
        data: incomeSeries,
        backgroundColor: isDark ? '#10B981' : '#0B4F44',
        hoverBackgroundColor: isDark ? '#34D399' : '#0F6B5C',
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.72,
        categoryPercentage: 0.62,
      },
      {
        label: 'Expenses',
        data: expenseSeries,
        backgroundColor: isDark ? '#D4A853' : '#C89E54',
        hoverBackgroundColor: isDark ? '#E3BE74' : '#B4833E',
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.72,
        categoryPercentage: 0.62,
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
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          pointStyle: 'rectRounded',
          padding: 16,
          color: isDark ? '#A8A29E' : '#57534E',
          font: {
            family: '"Plus Jakarta Sans", sans-serif',
            size: 12,
            weight: 500,
          },
        },
      },
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
          label: (ctx) =>
            ` ${ctx.dataset.label}: ${formatCurrency(Number(ctx.parsed.y || 0), currency)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: isDark ? '#A8A29E' : '#78716C',
          font: {
            family: '"Plus Jakarta Sans", sans-serif',
            size: 12,
            weight: 500,
          },
        },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(214, 211, 209, 0.5)',
        },
        ticks: {
          color: isDark ? '#A8A29E' : '#78716C',
          font: { family: '"JetBrains Mono", monospace', size: 11 },
          callback: (value) => formatCurrency(Number(value), currency, true),
        },
      },
    },
  };

  return (
    <div className="h-[280px] w-full">
      <Bar data={data} options={options} />
    </div>
  );
}
