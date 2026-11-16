import {
  Activity,
  Briefcase,
  Car,
  Film,
  GraduationCap,
  Home,
  Laptop,
  Plane,
  Receipt,
  ShoppingBag,
  TrendingUp,
  Utensils,
  Wallet,
  Zap,
} from 'lucide-react';

const CATEGORY_MAP = {
  'Food & Dining': {
    icon: Utensils,
    colorClass:
      'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  },
  'Housing & Rent': {
    icon: Home,
    colorClass:
      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  Transportation: {
    icon: Car,
    colorClass:
      'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400',
  },
  'Utilities & Bills': {
    icon: Zap,
    colorClass:
      'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400',
  },
  Shopping: {
    icon: ShoppingBag,
    colorClass:
      'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400',
  },
  'Software & Subscriptions': {
    icon: Laptop,
    colorClass:
      'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400',
  },
  Healthcare: {
    icon: Activity,
    colorClass:
      'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400',
  },
  Entertainment: {
    icon: Film,
    colorClass:
      'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400',
  },
  Travel: {
    icon: Plane,
    colorClass:
      'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  },
  Education: {
    icon: GraduationCap,
    colorClass:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  },
  Salary: {
    icon: Briefcase,
    colorClass:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  },
  Freelance: {
    icon: Laptop,
    colorClass:
      'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400',
  },
  Investments: {
    icon: TrendingUp,
    colorClass:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  },
  Bonus: {
    icon: Wallet,
    colorClass:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  },
  'Rental Income': {
    icon: Home,
    colorClass:
      'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400',
  },
};

export function CategoryIcon({ category, size = 'md' }) {
  const meta = CATEGORY_MAP[category] || {
    icon: Receipt,
    colorClass:
      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  };
  const Icon = meta.icon;
  const boxSize = size === 'sm' ? 'h-8 w-8 rounded-lg' : 'h-9 w-9 rounded-lg';
  const iconSize = 'h-4 w-4';

  return (
    <div
      className={`flex shrink-0 items-center justify-center ${boxSize} ${meta.colorClass}`}
      aria-hidden="true"
    >
      <Icon className={iconSize} />
    </div>
  );
}
