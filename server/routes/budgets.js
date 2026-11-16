import { Router } from 'express';
import {
  deleteBudget,
  findBudgets,
  findTransactions,
  upsertBudget,
} from '../db/store.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const month =
      typeof req.query.month === 'string' &&
      /^\d{4}-\d{2}$/.test(req.query.month)
        ? req.query.month
        : defaultMonth;

    const [budgets, monthExpenses] = await Promise.all([
      findBudgets(req.userId),
      findTransactions(req.userId, { type: 'expense', month }),
    ]);

    const spentByCategory = new Map();
    for (const tx of monthExpenses) {
      spentByCategory.set(
        tx.category,
        (spentByCategory.get(tx.category) || 0) + tx.amount
      );
    }

    const enriched = budgets.map((b) => {
      const spent =
        Math.round((spentByCategory.get(b.category) || 0) * 100) / 100;
      const remaining = Math.round((b.limit - spent) * 100) / 100;
      const percentUsed =
        b.limit > 0 ? Math.round((spent / b.limit) * 1000) / 10 : 0;
      let status = 'nominal';
      if (percentUsed >= 100) {
        status = 'exceeded';
      } else if (percentUsed >= 80) {
        status = 'warning';
      }
      return {
        ...b,
        month,
        spent,
        remaining,
        percentUsed,
        status,
      };
    });

    res.json({ budgets: enriched, month });
  } catch (err) {
    console.error('Get budgets error:', err);
    res.status(500).json({ error: 'Failed to load budgets.' });
  }
});

router.put('/', async (req, res) => {
  try {
    const { category, limit } = req.body;

    if (typeof category !== 'string' || !category.trim()) {
      res.status(400).json({ error: 'Budget category is required.' });
      return;
    }

    const numericLimit = Number(limit);
    if (!Number.isFinite(numericLimit) || numericLimit <= 0) {
      res.status(400).json({
        error: 'Monthly limit must be greater than zero.',
      });
      return;
    }

    const saved = await upsertBudget(
      req.userId,
      category.trim(),
      Math.round(numericLimit * 100) / 100
    );
    res.json({ budget: saved });
  } catch (err) {
    console.error('Upsert budget error:', err);
    res.status(500).json({ error: 'Failed to save budget.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteBudget(req.userId, req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Budget not found.' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Delete budget error:', err);
    res.status(500).json({ error: 'Failed to delete budget.' });
  }
});

export default router;
