import { useState } from 'react';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Menu,
  Moon,
  PieChart,
  Plus,
  Settings,
  ShieldCheck,
  Sun,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useExpenses } from '../../context/ExpenseContext';
import { useTheme } from '../../context/ThemeContext';
import {
  formatMonthLabel,
  getInitials,
  shiftMonthKey,
} from '../../utils/formatters';
import { BrandMark } from '../Common/BrandMark';

const BASE_NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ListOrdered },
  { id: 'budgets', label: 'Budgets', icon: PieChart },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const ADMIN_NAV_ITEM = {
  id: 'admin',
  label: 'Admin',
  icon: ShieldCheck,
};

export function WorkspaceShell({
  activeView,
  onSelectView,
  onOpenNewTransaction,
  children,
}) {
  const { user, logout } = useAuth();
  const { selectedMonth, setSelectedMonth } = useExpenses();
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems =
    user?.role === 'admin'
      ? [...BASE_NAV_ITEMS, ADMIN_NAV_ITEM]
      : BASE_NAV_ITEMS;

  const activeNav = navItems.find((n) => n.id === activeView) || navItems[0];

  const handleNavClick = (view) => {
    onSelectView(view);
    setMobileMenuOpen(false);
  };

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
    setConfirmLogout(false);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#FCFBF8] px-4 py-6 dark:bg-[#0D1014]">
      <div>
        <div className="flex items-center justify-between border-b border-stone-200/70 px-2 pb-6 dark:border-white/[0.07]">
          <BrandMark />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 lg:hidden dark:text-stone-400 dark:hover:bg-white/[0.06]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 px-3 text-[10px] font-semibold tracking-[0.16em] text-stone-400 uppercase dark:text-stone-500">
          Workspace
        </div>

        <nav className="mt-2.5 space-y-1" aria-label="Primary Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0B4F44]/10 text-[#0B4F44] shadow-[inset_0_0_0_1px_rgba(11,79,68,0.14)] dark:bg-[#D4A853]/12 dark:text-[#E6C37A] dark:shadow-[inset_0_0_0_1px_rgba(212,168,83,0.22)]'
                    : 'text-stone-600 hover:bg-stone-200/50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/[0.04] dark:hover:text-stone-100'
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute top-2 bottom-2 left-0 w-[3px] rounded-r-full bg-[#0B4F44] dark:bg-[#D4A853]"
                  />
                )}
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive
                      ? 'text-[#0B4F44] dark:text-[#D4A853]'
                      : 'text-stone-400 group-hover:text-stone-700 dark:text-stone-500 dark:group-hover:text-stone-300'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-stone-200/80 pt-4 dark:border-white/[0.08]">
        <div className="flex items-center gap-3 rounded-xl border border-stone-200/80 bg-white px-3 py-2.5 shadow-[0_1px_4px_-2px_rgba(17,19,21,0.06)] dark:border-white/[0.08] dark:bg-[#111418]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0E1318] text-xs font-semibold text-[#D4A853] ring-1 ring-[#D4A853]/35">
            {getInitials(user?.name || 'User')}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-stone-900 dark:text-stone-100">
              {user?.name}
            </div>
            <div className="truncate text-[11px] text-stone-500 dark:text-stone-400">
              {user?.role === 'admin' ? 'Owner Admin' : user?.email}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setConfirmLogout(true)}
          className="mt-2 flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-stone-400 dark:hover:bg-red-950/40 dark:hover:text-red-300 whitespace-nowrap"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-stone-900 dark:bg-[#0A0C0E] dark:text-stone-100">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-stone-200/80 lg:block dark:border-white/[0.08]">
          <div className="sticky top-0 h-screen">{sidebarContent}</div>
        </aside>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-[2px]"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 w-64 border-r border-stone-200/80 dark:border-white/[0.08]">
              {sidebarContent}
            </div>
          </div>
        )}

        {/* Main Workspace Viewport */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-stone-200/80 bg-[#F7F6F2]/85 px-4 backdrop-blur-xl sm:px-8 dark:border-white/[0.08] dark:bg-[#0A0C0E]/85">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 lg:hidden dark:border-white/[0.08] dark:bg-[#111418] dark:text-stone-300 dark:hover:bg-white/[0.06]"
              >
                <Menu className="h-4 w-4" />
              </button>

              <div className="flex min-w-0 items-center gap-2 text-sm">
                <span className="hidden text-xs font-medium tracking-wide text-stone-500 uppercase sm:inline dark:text-stone-400">
                  SpendWise
                </span>
                <span
                  className="hidden text-stone-300 sm:inline dark:text-stone-700"
                  aria-hidden="true"
                >
                  /
                </span>
                <span className="truncate font-editorial text-base font-medium text-stone-900 dark:text-stone-100">
                  {activeNav.label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Month selector */}
              {activeView !== 'settings' && activeView !== 'admin' && (
                <div className="flex items-center divide-x divide-stone-200/80 rounded-xl border border-stone-200/90 bg-white shadow-[0_1px_2px_rgba(17,19,21,0.04)] dark:divide-white/[0.08] dark:border-white/[0.08] dark:bg-[#111418]">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedMonth(shiftMonthKey(selectedMonth, -1))
                    }
                    aria-label="Previous month"
                    className="flex h-9 w-8 items-center justify-center text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-2.5 text-xs font-medium text-stone-800 sm:min-w-[136px] sm:text-center sm:text-sm dark:text-stone-200 whitespace-nowrap">
                    {formatMonthLabel(selectedMonth)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedMonth(shiftMonthKey(selectedMonth, 1))
                    }
                    aria-label="Next month"
                    className="flex h-9 w-8 items-center justify-center text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle color theme"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200/90 bg-white text-stone-600 shadow-[0_1px_2px_rgba(17,19,21,0.04)] transition-colors hover:bg-stone-100 hover:text-stone-900 dark:border-white/[0.08] dark:bg-[#111418] dark:text-stone-300 dark:hover:bg-white/[0.06]"
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </button>

              <button
                type="button"
                onClick={onOpenNewTransaction}
                className="flex h-9 items-center gap-1.5 rounded-xl bg-[#0B4F44] px-4 text-sm font-medium text-white shadow-[0_4px_12px_-4px_rgba(11,79,68,0.45)] transition-all hover:bg-[#083D34] dark:bg-[#D4A853] dark:text-[#0A0C0E] dark:shadow-[0_4px_14px_-4px_rgba(212,168,83,0.35)] dark:hover:bg-[#E0B96B] whitespace-nowrap shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Expense</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-7 sm:px-8 sm:py-9">
            {children}
          </main>
        </div>
      </div>

      {/* Logout confirmation modal */}
      {confirmLogout && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-dialog-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-white/[0.1] dark:bg-[#111418]">
            <h3
              id="logout-dialog-title"
              className="font-editorial text-lg font-semibold text-stone-900 dark:text-white"
            >
              Sign out of SpendWise?
            </h3>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              Your expense records and budgets remain securely saved. You can sign
              back in at any time.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmLogout(false)}
                className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-white/[0.12] dark:bg-white/[0.04] dark:text-stone-300 dark:hover:bg-white/[0.08] whitespace-nowrap"
              >
                Stay Signed In
              </button>
              <button
                type="button"
                disabled={loggingOut}
                onClick={handleConfirmLogout}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 whitespace-nowrap"
              >
                {loggingOut ? 'Signing out...' : 'Log out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
