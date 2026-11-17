import dns from 'node:dns';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';

import {
  UserModel,
  TransactionModel,
  BudgetModel,
} from '../models/mongooseModels.js';
dns.setServers(['8.8.8.8', '1.1.1.1']);

const DATA_FILE = path.resolve(
  process.cwd(),
  'data',
  'spendwise-db.json'
);

let storageMode = 'local-document-store';

// ----------------------------------
// ADMIN FUNCTIONS
// ----------------------------------

export function getOwnerAdminEmail() {
  return (
    process.env.ADMIN_EMAIL?.trim() ||
    'ajuajint@gmail.com'
  ).toLowerCase();
}

export function isOwnerAdminEmail(email) {
  return (
    typeof email === 'string' &&
    email.trim().toLowerCase() === getOwnerAdminEmail()
  );
}

// ----------------------------------
// LOCAL DATABASE FUNCTIONS
// ----------------------------------

async function ensureLocalDatabase() {
  await fs.mkdir(path.dirname(DATA_FILE), {
    recursive: true,
  });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(
      DATA_FILE,
      JSON.stringify(
        {
          users: [],
          transactions: [],
          budgets: [],
        },
        null,
        2
      ),
      'utf8'
    );
  }
}

async function readLocalDatabase() {
  await ensureLocalDatabase();

  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw || '{}');

    return {
      users: Array.isArray(parsed.users)
        ? parsed.users
        : [],
      transactions: Array.isArray(parsed.transactions)
        ? parsed.transactions
        : [],
      budgets: Array.isArray(parsed.budgets)
        ? parsed.budgets
        : [],
    };
  } catch (error) {
    console.error(
      'Could not read local SpendWise database:',
      error
    );

    throw new Error(
      'The local SpendWise database file is invalid or unreadable.'
    );
  }
}

async function writeLocalDatabase(database) {
  await ensureLocalDatabase();

  const temporaryFile = `${DATA_FILE}.tmp`;

  await fs.writeFile(
    temporaryFile,
    JSON.stringify(database, null, 2),
    'utf8'
  );

  await fs.rename(temporaryFile, DATA_FILE);
}

// ----------------------------------
// DOCUMENT HELPERS
// ----------------------------------

function plainDocument(document) {
  if (!document) return null;

  const value =
    typeof document.toObject === 'function'
      ? document.toObject()
      : { ...document };

  if (value._id !== undefined) {
    value._id = String(value._id);
  }

  if (value.userId !== undefined) {
    value.userId = String(value.userId);
  }

  delete value.__v;

  return value;
}

// ----------------------------------
// DATABASE CONNECTION
// ----------------------------------

export async function initDatabase() {
  const mongoUri = process.env.MONGODB_URI?.trim();

  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3500,
      });

      storageMode = 'mongodb';

      console.log('SpendWise connected to MongoDB.');

      return {
        mode: storageMode,
      };
    } catch (error) {
      console.warn(
        'MongoDB connection failed; using local JSON storage:',
        error.message
      );

      try {
        await mongoose.disconnect();
      } catch {
        // Ignore disconnect errors.
      }
    }
  }

  await ensureLocalDatabase();

  storageMode = 'local-document-store';

  console.log('Using local SpendWise database.');

  return {
    mode: storageMode,
  };
}

export function getStorageMode() {
  return storageMode;
}

// ----------------------------------
// USER FUNCTIONS
// ----------------------------------

export function toPublicUser(user) {
  if (!user) return null;

  const value = plainDocument(user);

  delete value.passwordHash;

  if (isOwnerAdminEmail(value.email)) {
    value.role = 'admin';
  }

  return value;
}

export async function findUserById(id) {
  if (!id) return null;

  if (storageMode === 'mongodb') {
    if (!mongoose.isValidObjectId(id)) return null;

    const user = await UserModel.findById(id).lean();

    return plainDocument(user);
  }

  const db = await readLocalDatabase();

  return (
    db.users.find(
      (user) => String(user._id) === String(id)
    ) || null
  );
}

export async function findUserByEmail(email) {
  if (typeof email !== 'string') return null;

  const normalizedEmail = email.trim().toLowerCase();

  if (storageMode === 'mongodb') {
    const user = await UserModel.findOne({
      email: normalizedEmail,
    }).lean();

    return plainDocument(user);
  }

  const db = await readLocalDatabase();

  return (
    db.users.find(
      (user) =>
        user.email?.toLowerCase() === normalizedEmail
    ) || null
  );
}

export async function createUser(userData) {
  const email = userData.email.trim().toLowerCase();

  const user = {
    ...userData,
    email,
    role: isOwnerAdminEmail(email) ? 'admin' : 'user',
    status: 'active',
    currency: userData.currency || 'USD',
    monthlyIncomeGoal: Number.isFinite(
      Number(userData.monthlyIncomeGoal)
    )
      ? Number(userData.monthlyIncomeGoal)
      : 5000,
  };

  if (storageMode === 'mongodb') {
    const created = await UserModel.create(user);

    return plainDocument(created);
  }

  const db = await readLocalDatabase();

  if (
    db.users.some(
      (item) => item.email?.toLowerCase() === email
    )
  ) {
    const error = new Error(
      'An account with this email already exists.'
    );

    error.code = 11000;

    throw error;
  }

  const created = {
    ...user,
    _id: randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.users.push(created);

  await writeLocalDatabase(db);

  return created;
}

export async function updateUser(id, updates) {
  const safeUpdates = { ...updates };

  delete safeUpdates._id;
  delete safeUpdates.role;
  delete safeUpdates.status;
  delete safeUpdates.email;

  if (storageMode === 'mongodb') {
    if (!mongoose.isValidObjectId(id)) return null;

    const updated = await UserModel.findByIdAndUpdate(
      id,
      { $set: safeUpdates },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    return plainDocument(updated);
  }

  const db = await readLocalDatabase();

  const index = db.users.findIndex(
    (user) => String(user._id) === String(id)
  );

  if (index === -1) return null;

  db.users[index] = {
    ...db.users[index],
    ...safeUpdates,
    updatedAt: new Date().toISOString(),
  };

  await writeLocalDatabase(db);

  return db.users[index];
}

export async function updateUserStatus(id, status) {
  if (storageMode === 'mongodb') {
    if (!mongoose.isValidObjectId(id)) return null;

    const updated = await UserModel.findByIdAndUpdate(
      id,
      { $set: { status } },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    return plainDocument(updated);
  }

  const db = await readLocalDatabase();

  const index = db.users.findIndex(
    (user) => String(user._id) === String(id)
  );

  if (index === -1) return null;

  db.users[index] = {
    ...db.users[index],
    status,
    updatedAt: new Date().toISOString(),
  };

  await writeLocalDatabase(db);

  return db.users[index];
}

export async function findAllUsers() {
  if (storageMode === 'mongodb') {
    const users = await UserModel.find()
      .sort({ createdAt: -1 })
      .lean();

    return users.map(plainDocument);
  }

  const db = await readLocalDatabase();

  return [...db.users].sort(
    (a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
  );
}

export async function deleteUserAndData(id) {
  if (storageMode === 'mongodb') {
    if (!mongoose.isValidObjectId(id)) return false;

    const user = await UserModel.findByIdAndDelete(id);

    if (!user) return false;

    await Promise.all([
      TransactionModel.deleteMany({
        userId: String(id),
      }),
      BudgetModel.deleteMany({
        userId: String(id),
      }),
    ]);

    return true;
  }

  const db = await readLocalDatabase();

  const before = db.users.length;

  db.users = db.users.filter(
    (user) => String(user._id) !== String(id)
  );

  if (db.users.length === before) return false;

  db.transactions = db.transactions.filter(
    (tx) => String(tx.userId) !== String(id)
  );

  db.budgets = db.budgets.filter(
    (budget) => String(budget.userId) !== String(id)
  );

  await writeLocalDatabase(db);

  return true;
}

// ----------------------------------
// TRANSACTION FILTERING
// ----------------------------------

function matchesTransactionQuery(transaction, query = {}) {
  if (query.type && transaction.type !== query.type) {
    return false;
  }

  if (
    query.category &&
    transaction.category !== query.category
  ) {
    return false;
  }

  if (
    query.paymentMethod &&
    transaction.paymentMethod !== query.paymentMethod
  ) {
    return false;
  }

  if (
    query.month &&
    !String(transaction.date || '').startsWith(query.month)
  ) {
    return false;
  }

  if (
    query.startDate &&
    transaction.date < query.startDate
  ) {
    return false;
  }

  if (
    query.endDate &&
    transaction.date > query.endDate
  ) {
    return false;
  }

  if (query.search) {
    const search = query.search.toLowerCase();

    const haystack = [
      transaction.title,
      transaction.category,
      transaction.notes,
      transaction.paymentMethod,
    ]
      .join(' ')
      .toLowerCase();

    if (!haystack.includes(search)) {
      return false;
    }
  }

  return true;
}

// ----------------------------------
// TRANSACTION FUNCTIONS
// ----------------------------------

export async function findTransactions(userId, query = {}) {
  if (storageMode === 'mongodb') {
    const filter = {
      userId: String(userId),
    };

    if (query.type) filter.type = query.type;

    if (query.category) {
      filter.category = query.category;
    }

    if (query.paymentMethod) {
      filter.paymentMethod = query.paymentMethod;
    }

    const dateFilter = {};

    if (query.month) {
      dateFilter.$gte = `${query.month}-01`;
      dateFilter.$lte = `${query.month}-31`;
    }

    if (query.startDate) {
      dateFilter.$gte = query.startDate;
    }

    if (query.endDate) {
      dateFilter.$lte = query.endDate;
    }

    if (Object.keys(dateFilter).length) {
      filter.date = dateFilter;
    }

    if (query.search) {
      const escaped = query.search.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );

      const regex = new RegExp(escaped, 'i');

      filter.$or = [
        { title: regex },
        { category: regex },
        { notes: regex },
        { paymentMethod: regex },
      ];
    }

    const sortField = [
      'amount',
      'title',
      'category',
      'date',
    ].includes(query.sortBy)
      ? query.sortBy
      : 'date';

    const sortDirection =
      query.sortOrder === 'asc' ? 1 : -1;

    const rows = await TransactionModel.find(filter)
      .sort({
        [sortField]: sortDirection,
        createdAt: -1,
      })
      .lean();

    return rows.map(plainDocument);
  }

  const db = await readLocalDatabase();

  const rows = db.transactions
    .filter(
      (tx) => String(tx.userId) === String(userId)
    )
    .filter((tx) =>
      matchesTransactionQuery(tx, query)
    );

  const sortField = [
    'amount',
    'title',
    'category',
    'date',
  ].includes(query.sortBy)
    ? query.sortBy
    : 'date';

  const direction =
    query.sortOrder === 'asc' ? 1 : -1;

  return rows.sort((a, b) => {
    const left = a[sortField] ?? '';
    const right = b[sortField] ?? '';

    if (
      typeof left === 'number' &&
      typeof right === 'number'
    ) {
      return (left - right) * direction;
    }

    return (
      String(left).localeCompare(String(right)) *
      direction
    );
  });
}

export async function createTransaction(userId, transactionData) {
  const data = {
    ...transactionData,
    userId: String(userId),
  };

  if (storageMode === 'mongodb') {
    const created = await TransactionModel.create(data);

    return plainDocument(created);
  }

  const db = await readLocalDatabase();

  const created = {
    ...data,
    _id: randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.transactions.push(created);

  await writeLocalDatabase(db);

  return created;
}

export async function updateTransaction(userId, id, updates) {
  if (storageMode === 'mongodb') {
    if (!mongoose.isValidObjectId(id)) return null;

    const updated = await TransactionModel.findOneAndUpdate(
      {
        _id: id,
        userId: String(userId),
      },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    return plainDocument(updated);
  }

  const db = await readLocalDatabase();

  const index = db.transactions.findIndex(
    (tx) =>
      String(tx._id) === String(id) &&
      String(tx.userId) === String(userId)
  );

  if (index === -1) return null;

  db.transactions[index] = {
    ...db.transactions[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await writeLocalDatabase(db);

  return db.transactions[index];
}

export async function deleteTransaction(userId, id) {
  if (storageMode === 'mongodb') {
    if (!mongoose.isValidObjectId(id)) return false;

    const result = await TransactionModel.deleteOne({
      _id: id,
      userId: String(userId),
    });

    return result.deletedCount > 0;
  }

  const db = await readLocalDatabase();

  const before = db.transactions.length;

  db.transactions = db.transactions.filter(
    (tx) =>
      !(
        String(tx._id) === String(id) &&
        String(tx.userId) === String(userId)
      )
  );

  if (db.transactions.length === before) {
    return false;
  }

  await writeLocalDatabase(db);

  return true;
}

// ----------------------------------
// BUDGET FUNCTIONS
// ----------------------------------

export async function findBudgets(userId) {
  if (storageMode === 'mongodb') {
    const rows = await BudgetModel.find({
      userId: String(userId),
    })
      .sort({ category: 1 })
      .lean();

    return rows.map(plainDocument);
  }

  const db = await readLocalDatabase();

  return db.budgets
    .filter(
      (budget) =>
        String(budget.userId) === String(userId)
    )
    .sort((a, b) =>
      a.category.localeCompare(b.category)
    );
}

export async function upsertBudget(userId, category, limit) {
  if (storageMode === 'mongodb') {
    const saved = await BudgetModel.findOneAndUpdate(
      {
        userId: String(userId),
        category,
      },
      {
        $set: { limit },
        $setOnInsert: {
          userId: String(userId),
          category,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    return plainDocument(saved);
  }

  const db = await readLocalDatabase();

  const existing = db.budgets.find(
    (budget) =>
      String(budget.userId) === String(userId) &&
      budget.category === category
  );

  if (existing) {
    existing.limit = limit;
    existing.updatedAt = new Date().toISOString();

    await writeLocalDatabase(db);

    return existing;
  }

  const created = {
    _id: randomUUID(),
    userId: String(userId),
    category,
    limit,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.budgets.push(created);

  await writeLocalDatabase(db);

  return created;
}

export async function deleteBudget(userId, id) {
  if (storageMode === 'mongodb') {
    if (!mongoose.isValidObjectId(id)) return false;

    const result = await BudgetModel.deleteOne({
      _id: id,
      userId: String(userId),
    });

    return result.deletedCount > 0;
  }

  const db = await readLocalDatabase();

  const before = db.budgets.length;

  db.budgets = db.budgets.filter(
    (budget) =>
      !(
        String(budget._id) === String(id) &&
        String(budget.userId) === String(userId)
      )
  );

  if (db.budgets.length === before) {
    return false;
  }

  await writeLocalDatabase(db);

  return true;
}

// ----------------------------------
// ADMIN REPORT FUNCTIONS
// ----------------------------------

export async function findAllTransactions() {
  if (storageMode === 'mongodb') {
    const rows = await TransactionModel.find()
      .sort({
        date: -1,
        createdAt: -1,
      })
      .lean();

    return rows.map(plainDocument);
  }

  const db = await readLocalDatabase();

  return [...db.transactions].sort(
    (a, b) =>
      String(b.date).localeCompare(String(a.date))
  );
}

export async function findAllBudgets() {
  if (storageMode === 'mongodb') {
    const rows = await BudgetModel.find()
      .sort({ createdAt: -1 })
      .lean();

    return rows.map(plainDocument);
  }

  const db = await readLocalDatabase();

  return [...db.budgets];
}
