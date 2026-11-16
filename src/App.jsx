import { useEffect, useState } from 'react';
import { AuthScreen } from './components/Auth/AuthScreen';
import { WorkspaceShell } from './components/Layout/WorkspaceShell';
import { TransactionModal } from './components/Transactions/TransactionModal';
import { AdminView } from './components/Views/AdminView';
import { AnalyticsView } from './components/Views/AnalyticsView';
import { BudgetsView } from './components/Views/BudgetsView';
import { OverviewView } from './components/Views/OverviewView';
import { SettingsView } from './components/Views/SettingsView';
import { TransactionsView } from './components/Views/TransactionsView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ExpenseProvider, useExpenses } from './context/ExpenseContext';
import { ThemeProvider } from './context/ThemeContext';

function SpendWiseWorkspace() {
  const { user, initializing } = useAuth();
  const { error, clearError } = useExpenses();

  const [activeView, setActiveView] = useState('overview');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  useEffect(() => {
    if (!user) {
      setActiveView('overview');
      setModalOpen(false);
      setEditingTx(null);
    }
  }, [user]);

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F6F2] text-stone-600 dark:bg-[#0A0C0E] dark:text-stone-400">
        <div className="text-center">
          <div className="font-editorial text-xl font-semibold text-stone-900 dark:text-stone-100">
            SpendWise
          </div>
          <p className="mt-1 text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const handleOpenNew = () => {
    setEditingTx(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (tx) => {
    setEditingTx(tx);
    setModalOpen(true);
  };

  return (
    <>
      <WorkspaceShell
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenNewTransaction={handleOpenNew}
      >
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={clearError}
              className="text-xs font-medium underline whitespace-nowrap"
            >
              Dismiss
            </button>
          </div>
        )}

        {activeView === 'overview' && (
          <OverviewView
            onNavigate={setActiveView}
            onAddTransaction={handleOpenNew}
            onEditTransaction={handleOpenEdit}
          />
        )}

        {activeView === 'transactions' && (
          <TransactionsView
            onAddTransaction={handleOpenNew}
            onEditTransaction={handleOpenEdit}
          />
        )}

        {activeView === 'budgets' && <BudgetsView />}

        {activeView === 'analytics' && <AnalyticsView />}

        {activeView === 'settings' && <SettingsView />}

        {activeView === 'admin' && user.role === 'admin' && <AdminView />}
      </WorkspaceShell>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTx(null);
        }}
        editingTransaction={editingTx}
        currency={user.currency}
      />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ExpenseProvider>
          <SpendWiseWorkspace />
        </ExpenseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
