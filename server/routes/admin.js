import { Router } from 'express';
import {
  deleteUserAndData,
  findAllBudgets,
  findAllTransactions,
  findAllUsers,
  findUserById,
  getOwnerAdminEmail,
  isOwnerAdminEmail,
  toPublicUser,
  updateUserStatus,
} from '../db/store.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/overview', async (_req, res) => {
  try {
    const [users, transactions, budgets] = await Promise.all([
      findAllUsers(),
      findAllTransactions(),
      findAllBudgets(),
    ]);

    const txByUser = new Map();

    const budgetsByUser = new Map();
    for (const b of budgets) {
      budgetsByUser.set(b.userId, (budgetsByUser.get(b.userId) || 0) + 1);
    }

    const categoryTotals = new Map();
    let totalExpenseVolume = 0;
    let totalIncomeVolume = 0;

    for (const tx of transactions) {
      const prev = txByUser.get(tx.userId) || {
        count: 0,
        totalExpenses: 0,
        totalIncome: 0,
        lastActivityDate: null,
      };
      prev.count += 1;
      if (tx.type === 'expense') {
        prev.totalExpenses += tx.amount;
        totalExpenseVolume += tx.amount;
        const cat = categoryTotals.get(tx.category) || { amount: 0, count: 0 };
        cat.amount += tx.amount;
        cat.count += 1;
        categoryTotals.set(tx.category, cat);
      } else {
        prev.totalIncome += tx.amount;
        totalIncomeVolume += tx.amount;
      }
      if (!prev.lastActivityDate || tx.date > prev.lastActivityDate) {
        prev.lastActivityDate = tx.date;
      }
      txByUser.set(tx.userId, prev);
    }

    const userMap = new Map(users.map((u) => [u._id, u]));

    const enrichedUsers = users.map((u) => {
      const stats = txByUser.get(u._id) || {
        count: 0,
        totalExpenses: 0,
        totalIncome: 0,
        lastActivityDate: null,
      };
      return {
        ...toPublicUser(u),
        transactionCount: stats.count,
        budgetCount: budgetsByUser.get(u._id) || 0,
        totalExpenses: Math.round(stats.totalExpenses * 100) / 100,
        totalIncome: Math.round(stats.totalIncome * 100) / 100,
        lastActivityDate: stats.lastActivityDate,
      };
    });

    const topCategories = Array.from(categoryTotals.entries())
      .map(([category, info]) => ({
        category,
        amount: Math.round(info.amount * 100) / 100,
        count: info.count,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);

    const recentTransactions = transactions.slice(0, 15).map((tx) => {
      const owner = userMap.get(tx.userId);
      return {
        _id: tx._id,
        title: tx.title,
        amount: tx.amount,
        type: tx.type,
        category: tx.category,
        date: tx.date,
        paymentMethod: tx.paymentMethod,
        ownerName: owner?.name || 'Unknown User',
        ownerEmail: owner?.email || '',
        ownerCurrency: owner?.currency || 'USD',
      };
    });

    const activeUsers = users.filter((u) => u.status !== 'suspended').length;
    const suspendedUsers = users.length - activeUsers;

    res.json({
      ownerAdminEmail: getOwnerAdminEmail(),
      metrics: {
        totalUsers: users.length,
        activeUsers,
        suspendedUsers,
        totalTransactions: transactions.length,
        totalBudgets: budgets.length,
        totalExpenseVolume: Math.round(totalExpenseVolume * 100) / 100,
        totalIncomeVolume: Math.round(totalIncomeVolume * 100) / 100,
      },
      users: enrichedUsers,
      topCategories,
      recentTransactions,
    });
  } catch (err) {
    console.error('Admin overview error:', err);
    res.status(500).json({ error: 'Failed to load admin overview.' });
  }
});

router.patch('/users/:id/status', async (req, res) => {
  try {
    const target = await findUserById(req.params.id);
    if (!target) {
      res.status(404).json({ error: 'User account not found.' });
      return;
    }

    if (isOwnerAdminEmail(target.email)) {
      res.status(400).json({
        error: 'Owner administrator account cannot be suspended.',
      });
      return;
    }

    const { status } = req.body;
    if (status !== 'active' && status !== 'suspended') {
      res.status(400).json({ error: 'Status must be active or suspended.' });
      return;
    }

    const updated = await updateUserStatus(target._id, status);
    if (!updated) {
      res.status(404).json({ error: 'User account not found.' });
      return;
    }

    res.json({ user: toPublicUser(updated) });
  } catch (err) {
    console.error('Admin status update error:', err);
    res.status(500).json({ error: 'Failed to update account status.' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const target = await findUserById(req.params.id);
    if (!target) {
      res.status(404).json({ error: 'User account not found.' });
      return;
    }

    if (isOwnerAdminEmail(target.email)) {
      res.status(400).json({
        error: 'Owner administrator account cannot be deleted.',
      });
      return;
    }

    const removed = await deleteUserAndData(target._id);
    if (!removed) {
      res.status(404).json({ error: 'User account not found.' });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Admin delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user account.' });
  }
});

export default router;
