import { Router } from 'express';
import {
  createTransaction,
  deleteTransaction,
  findTransactions,
  updateTransaction,
} from '../db/store.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const VALID_PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Cash',
  'Digital Wallet',
];

function escapeCsvCell(value) {
  let str = String(value ?? '');

  // Spreadsheet applications may execute cells beginning with formula markers.
  // Prefix an apostrophe so exported user-controlled text is treated as text.
  if (/^[\t\r ]*[=+\-@]/.test(str)) {
    str = `'${str}`;
  }

  // Always quote cells and escape embedded quotes per RFC 4180.
  return `"${str.replace(/"/g, '""')}"`;
}

function isValidCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const query = {
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      category:
        typeof req.query.category === 'string' ? req.query.category : undefined,
      type: typeof req.query.type === 'string' ? req.query.type : undefined,
      paymentMethod:
        typeof req.query.paymentMethod === 'string'
          ? req.query.paymentMethod
          : undefined,
      month: typeof req.query.month === 'string' ? req.query.month : undefined,
      startDate:
        typeof req.query.startDate === 'string'
          ? req.query.startDate
          : undefined,
      endDate:
        typeof req.query.endDate === 'string' ? req.query.endDate : undefined,
      sortBy:
        req.query.sortBy === 'amount' ||
        req.query.sortBy === 'title' ||
        req.query.sortBy === 'category' ||
        req.query.sortBy === 'date'
          ? req.query.sortBy
          : 'date',
      sortOrder: req.query.sortOrder === 'asc' ? 'asc' : 'desc',
    };

    const transactions = await findTransactions(req.userId, query);

    let totalIncome = 0;
    let totalExpenses = 0;
    for (const tx of transactions) {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpenses += tx.amount;
      }
    }

    const netBalance = totalIncome - totalExpenses;
    const savingsRate =
      totalIncome > 0
        ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 1000) / 10
        : 0;

    res.json({
      transactions,
      summary: {
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netBalance: Math.round(netBalance * 100) / 100,
        savingsRate,
        count: transactions.length,
      },
    });
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ error: 'Failed to load transactions.' });
  }
});

router.get('/export/csv', async (req, res) => {
  try {
    const query = {
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      category:
        typeof req.query.category === 'string' ? req.query.category : undefined,
      type: typeof req.query.type === 'string' ? req.query.type : undefined,
      month: typeof req.query.month === 'string' ? req.query.month : undefined,
    };
    const rows = await findTransactions(req.userId, query);
    const header = [
      'Date',
      'Title',
      'Type',
      'Category',
      'Amount',
      'Payment Method',
      'Recurring',
      'Notes',
    ].join(',');
    const lines = rows.map((r) =>
      [
        escapeCsvCell(r.date),
        escapeCsvCell(r.title),
        escapeCsvCell(r.type),
        escapeCsvCell(r.category),
        escapeCsvCell(r.amount.toFixed(2)),
        escapeCsvCell(r.paymentMethod),
        escapeCsvCell(r.recurring ? 'Yes' : 'No'),
        escapeCsvCell(r.notes),
      ].join(',')
    );

    const csv = [header, ...lines].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="spendwise-transactions.csv"'
    );
    res.send(csv);
  } catch (err) {
    console.error('Export CSV error:', err);
    res.status(500).json({ error: 'Failed to export CSV.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      title,
      amount,
      type,
      category,
      date,
      paymentMethod,
      notes,
      recurring,
    } = req.body;

    if (typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'Title or merchant name is required.' });
      return;
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      res.status(400).json({ error: 'Amount must be greater than zero.' });
      return;
    }

    if (type !== 'expense' && type !== 'income') {
      res.status(400).json({
        error: 'Transaction type must be expense or income.',
      });
      return;
    }

    if (typeof category !== 'string' || !category.trim()) {
      res.status(400).json({ error: 'Category is required.' });
      return;
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ error: 'Valid date (YYYY-MM-DD) is required.' });
      return;
    }

    const validPayment =
      paymentMethod && VALID_PAYMENT_METHODS.includes(paymentMethod)
        ? paymentMethod
        : 'Credit Card';

    const created = await createTransaction(req.userId, {
      title: title.trim(),
      amount: Math.round(numericAmount * 100) / 100,
      type,
      category: category.trim(),
      date,
      paymentMethod: validPayment,
      notes: typeof notes === 'string' ? notes.trim() : '',
      recurring: Boolean(recurring),
    });

    res.status(201).json({ transaction: created });
  } catch (err) {
    console.error('Create transaction error:', err);
    res.status(500).json({ error: 'Failed to save transaction.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const {
      title,
      amount,
      type,
      category,
      date,
      paymentMethod,
      notes,
      recurring,
    } = req.body;

    const updates = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        res.status(400).json({ error: 'Title cannot be empty.' });
        return;
      }
      updates.title = title.trim();
    }

    if (amount !== undefined) {
      const numericAmount = Number(amount);
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        res.status(400).json({ error: 'Amount must be greater than zero.' });
        return;
      }
      updates.amount = Math.round(numericAmount * 100) / 100;
    }

    if (type !== undefined) {
      if (type !== 'expense' && type !== 'income') {
        res.status(400).json({ error: 'Invalid transaction type.' });
        return;
      }
      updates.type = type;
    }

    if (category !== undefined) {
      if (typeof category !== 'string' || !category.trim()) {
        res.status(400).json({ error: 'Category cannot be empty.' });
        return;
      }
      updates.category = category.trim();
    }

    if (date !== undefined) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        res.status(400).json({
          error: 'Valid date (YYYY-MM-DD) is required.',
        });
        return;
      }
      updates.date = date;
    }

    if (paymentMethod !== undefined) {
      if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
        res.status(400).json({ error: 'Invalid payment method.' });
        return;
      }
      updates.paymentMethod = paymentMethod;
    }

    if (notes !== undefined) {
      if (typeof notes !== 'string') {
        res.status(400).json({ error: 'Notes must be text.' });
        return;
      }
      updates.notes = notes.trim();
    }

    if (recurring !== undefined) {
      updates.recurring = Boolean(recurring);
    }

    const updated = await updateTransaction(req.userId, id, updates);
    if (!updated) {
      res.status(404).json({ error: 'Transaction not found.' });
      return;
    }

    res.json({ transaction: updated });
  } catch (err) {
    console.error('Update transaction error:', err);
    res.status(500).json({ error: 'Failed to update transaction.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteTransaction(req.userId, req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Transaction not found.' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Delete transaction error:', err);
    res.status(500).json({ error: 'Failed to delete transaction.' });
  }
});

export default router;
