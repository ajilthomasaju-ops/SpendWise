import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Moon, ShieldCheck, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { CURRENCY_CONFIG } from '../../types/finance';
import { BrandMark } from '../Common/BrandMark';

const EDITORIAL_IMAGE =
  '/src/assets/images/spendwise_auth_editorial_1794820899600.jpg';

export function AuthScreen() {
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [monthlyIncomeGoal, setMonthlyIncomeGoal] = useState('5000');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imgFailed, setImgFailed] = useState(false);

  const switchMode = (next) => {
    setMode(next);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          currency,
          monthlyIncomeGoal: Number(monthlyIncomeGoal) || 5000,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Authentication failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-stone-900 dark:bg-[#0A0C0E] dark:text-stone-100">
      <div className="mx-auto grid min-h-screen max-w-[1440px] grid-cols-1 lg:grid-cols-12">
        {/* Left editorial private-client panel */}
        <div className="relative hidden overflow-hidden border-r border-stone-200/80 bg-[#0E1318] lg:col-span-5 lg:flex lg:flex-col lg:justify-between dark:border-white/[0.08]">
          {!imgFailed ? (
            <img
              src={EDITORIAL_IMAGE}
              alt="Personal financial ledger notebook and fountain pen on stone desk"
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="absolute inset-0 h-full w-full object-cover opacity-75"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#0E1318] via-[#121A1D] to-[#0B4F44]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C0E]/95 via-[#0E1318]/60 to-[#0E1318]/45" />

          <div className="relative z-10 p-10">
            <BrandMark inverted />
          </div>

          <div className="relative z-10 space-y-6 p-10">
            <div>
              <p className="text-xs font-medium tracking-widest text-[#D4A853]">
                Private Expense Ledger
              </p>
              <h1 className="font-editorial mt-3 max-w-md text-3xl font-medium leading-tight text-white [text-wrap:balance]">
                Clarity across every expense, budget, and monthly cashflow.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-stone-300">
                Record daily spending, monitor category caps in real time, and
                review refined monthly analytics in one private workspace.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-white/15 pt-6 text-xs text-stone-300">
              <div>
                <div className="font-semibold text-white">JWT Auth</div>
                <div className="mt-1 text-stone-400">Encrypted sessions</div>
              </div>
              <div>
                <div className="font-semibold text-white">Budget Caps</div>
                <div className="mt-1 text-stone-400">Category alerts</div>
              </div>
              <div>
                <div className="font-semibold text-white">CSV Export</div>
                <div className="mt-1 text-stone-400">Full data control</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right authentication form column */}
        <div className="relative flex flex-col justify-between px-6 py-6 sm:px-12 sm:py-8 lg:col-span-7 lg:px-16">
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200/90 bg-white text-stone-600 shadow-xs transition-colors hover:bg-stone-100 hover:text-stone-900 dark:border-white/[0.08] dark:bg-[#111418] dark:text-stone-300 dark:hover:bg-white/[0.06]"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="mx-auto my-auto w-full max-w-md space-y-4 py-5">
            {/* Editorial SpendWise Title Card */}
            <div className="relative overflow-hidden rounded-2xl border border-stone-200/90 bg-gradient-to-br from-[#FCFBF8] via-white to-[#F4EFE4] p-5 shadow-[0_10px_30px_-16px_rgba(17,19,21,0.1)] sm:p-6 dark:border-white/[0.09] dark:bg-gradient-to-br dark:from-[#13181D] dark:via-[#111418] dark:to-[#0D1A18]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#0B4F44] via-[#B4833E] to-[#0B4F44] opacity-80 dark:from-[#0B4F44] dark:via-[#D4A853] dark:to-[#0B4F44]" />

              <div className="flex items-start justify-between gap-3">
                <BrandMark />
                <span className="pt-1 text-[11px] font-semibold tracking-[0.14em] text-[#9A6B29] uppercase dark:text-[#D4A853]">
                  Expense Ledger
                </span>
              </div>

              <h2 className="font-editorial mt-3.5 text-lg font-semibold leading-snug tracking-tight text-stone-900 sm:text-xl dark:text-stone-100">
                Intelligent tracking for everyday spending &amp; monthly budgets.
              </h2>

              <p className="mt-1.5 text-xs leading-relaxed text-stone-600 sm:text-[13px] dark:text-stone-400">
                SpendWise brings transactions, category spending caps, cashflow
                analytics, and instant CSV exports together in one private
                financial workspace.
              </p>

              <div className="mt-4 grid grid-cols-3 divide-x divide-stone-200/90 border-t border-stone-200/80 pt-3.5 dark:divide-white/[0.08] dark:border-white/[0.08]">
                <div className="pr-3">
                  <div className="text-[11px] font-semibold text-stone-900 dark:text-stone-100">
                    Cashflow
                  </div>
                  <div className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
                    Income &amp; spend
                  </div>
                </div>
                <div className="px-3">
                  <div className="text-[11px] font-semibold text-stone-900 dark:text-stone-100">
                    Budgets
                  </div>
                  <div className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
                    Category alerts
                  </div>
                </div>
                <div className="pl-3">
                  <div className="text-[11px] font-semibold text-stone-900 dark:text-stone-100">
                    Analytics
                  </div>
                  <div className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
                    Trends &amp; CSV
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200/90 bg-white p-7 shadow-[0_12px_36px_-16px_rgba(17,19,21,0.12)] sm:p-8 dark:border-white/[0.08] dark:bg-[#111418]">
              <div className="mb-6">
                <h2 className="font-editorial text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
                  {mode === 'login'
                    ? 'Sign in to your ledger'
                    : 'Create your account'}
                </h2>
                <p className="mt-1.5 text-sm text-stone-600 dark:text-stone-400">
                  {mode === 'login'
                    ? 'Access your personal expenses, budgets, and analytics.'
                    : 'Set up your personal expense workspace in under a minute.'}
                </p>
              </div>

              {/* Segmented Login / Register switcher */}
              <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-stone-100 p-1 dark:bg-white/[0.05]">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    mode === 'login'
                      ? 'bg-white text-stone-900 shadow-xs dark:bg-[#1A1F25] dark:text-white'
                      : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    mode === 'register'
                      ? 'bg-white text-stone-900 shadow-xs dark:bg-[#1A1F25] dark:text-white'
                      : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label
                      htmlFor="auth-name"
                      className="mb-1.5 block text-xs font-medium tracking-wide text-stone-600 dark:text-stone-400"
                    >
                      Full Name
                    </label>
                    <input
                      id="auth-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jordan Patel"
                      className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#0B4F44] focus:ring-2 focus:ring-[#0B4F44]/15 focus:outline-none dark:border-white/[0.12] dark:bg-[#0A0C0E] dark:text-stone-100 dark:focus:border-[#D4A853]"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="auth-email"
                    className="mb-1.5 block text-xs font-medium tracking-wide text-stone-600 dark:text-stone-400"
                  >
                    Email Address
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#0B4F44] focus:ring-2 focus:ring-[#0B4F44]/15 focus:outline-none dark:border-white/[0.12] dark:bg-[#0A0C0E] dark:text-stone-100 dark:focus:border-[#D4A853]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="auth-password"
                    className="mb-1.5 block text-xs font-medium tracking-wide text-stone-600 dark:text-stone-400"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete={
                        mode === 'login' ? 'current-password' : 'new-password'
                      }
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={
                        mode === 'login'
                          ? 'Enter your password'
                          : 'Minimum 6 characters'
                      }
                      className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pr-11 pl-3.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#0B4F44] focus:ring-2 focus:ring-[#0B4F44]/15 focus:outline-none dark:border-white/[0.12] dark:bg-[#0A0C0E] dark:text-stone-100 dark:focus:border-[#D4A853]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {mode === 'register' && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="auth-currency"
                        className="mb-1.5 block text-xs font-medium tracking-wide text-stone-600 dark:text-stone-400"
                      >
                        Currency
                      </label>
                      <select
                        id="auth-currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-[#0B4F44] focus:ring-2 focus:ring-[#0B4F44]/15 focus:outline-none dark:border-white/[0.12] dark:bg-[#0A0C0E] dark:text-stone-100 dark:focus:border-[#D4A853]"
                      >
                        {Object.keys(CURRENCY_CONFIG).map((code) => (
                          <option key={code} value={code}>
                            {CURRENCY_CONFIG[code].label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="auth-goal"
                        className="mb-1.5 block text-xs font-medium tracking-wide text-stone-600 dark:text-stone-400"
                      >
                        Monthly Income Goal
                      </label>
                      <input
                        id="auth-goal"
                        type="number"
                        min="0"
                        step="100"
                        value={monthlyIncomeGoal}
                        onChange={(e) => setMonthlyIncomeGoal(e.target.value)}
                        className="font-mono-num w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-[#0B4F44] focus:ring-2 focus:ring-[#0B4F44]/15 focus:outline-none dark:border-white/[0.12] dark:bg-[#0A0C0E] dark:text-stone-100 dark:focus:border-[#D4A853]"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B4F44] px-5 py-3 text-sm font-medium text-white shadow-xs transition-colors hover:bg-[#083D34] disabled:opacity-60 dark:bg-[#D4A853] dark:text-[#0A0C0E] dark:hover:bg-[#E0B96B]"
                >
                  <span>
                    {submitting
                      ? mode === 'login'
                        ? 'Signing in...'
                        : 'Creating account...'
                      : mode === 'login'
                        ? 'Sign In'
                        : 'Create Account'}
                  </span>
                  {!submitting && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-500">
            <ShieldCheck className="h-4 w-4 text-[#0B4F44] dark:text-[#D4A853]" />
            <span>
              SpendWise Personal Expense Tracker · JWT Protected Workspace
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
