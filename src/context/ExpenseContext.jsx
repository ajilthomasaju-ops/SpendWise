import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { budgetsApi, transactionsApi } from '../services/api';
import { getCurrentMonthKey } from '../utils/formatters';
import { useAuth } from './AuthContext';

const ExpenseContext = createContext(null);

export function ExpenseProvider({ children }) {
  const { user, token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() =>
    getCurrentMonthKey()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshData = useCallback(async () => {
    if (!user || !token) {
      setTransactions([]);
      setBudgets([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [txRes, budgetRes] = await Promise.all([
        transactionsApi.list(),
        budgetsApi.list(selectedMonth),
      ]);
      setTransactions(txRes.transactions);
      setBudgets(budgetRes.budgets);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load financial data.'
      );
    } finally {
      setLoading(false);
    }
  }, [user, token, selectedMonth]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const monthTransactions = useMemo(
    () => transactions.filter((t) => t.date.startsWith(selectedMonth)),
    [transactions, selectedMonth]
  );

  const addTransaction = useCallback(
    async (payload) => {
      const res = await transactionsApi.create(payload);
      await refreshData();
      return res.transaction;
    },
    [refreshData]
  );

  const editTransaction = useCallback(
    async (id, payload) => {
      const res = await transactionsApi.update(id, payload);
      await refreshData();
      return res.transaction;
    },
    [refreshData]
  );

  const removeTransaction = useCallback(
    async (id) => {
      await transactionsApi.remove(id);
      await refreshData();
    },
    [refreshData]
  );

  const saveBudget = useCallback(
    async (category, limit) => {
      await budgetsApi.upsert({ category, limit });
      await refreshData();
    },
    [refreshData]
  );

  const removeBudget = useCallback(
    async (id) => {
      await budgetsApi.remove(id);
      await refreshData();
    },
    [refreshData]
  );

  const clearError = useCallback(() => setError(null), []);

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
        monthTransactions,
        budgets,
        selectedMonth,
        setSelectedMonth,
        loading,
        error,
        clearError,
        refreshData,
        addTransaction,
        editTransaction,
        removeTransaction,
        saveBudget,
        removeBudget,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) {
    throw new Error('useExpenses must be used within ExpenseProvider');
  }
  return ctx;
}
