import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD'],
      default: 'USD',
    },
    monthlyIncomeGoal: { type: Number, default: 5000, min: 0 },
  },
  { timestamps: true }
);

const TransactionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
    type: { type: String, enum: ['expense', 'income'], required: true },
    category: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    paymentMethod: {
      type: String,
      enum: [
        'Credit Card',
        'Debit Card',
        'Bank Transfer',
        'Cash',
        'Digital Wallet',
      ],
      default: 'Credit Card',
    },
    notes: { type: String, default: '', trim: true },
    recurring: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TransactionSchema.index({ userId: 1, date: -1 });

const BudgetSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    category: { type: String, required: true, trim: true },
    limit: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

BudgetSchema.index({ userId: 1, category: 1 }, { unique: true });

export const UserModel =
  mongoose.models.User || mongoose.model('User', UserSchema);

export const TransactionModel =
  mongoose.models.Transaction ||
  mongoose.model('Transaction', TransactionSchema);

export const BudgetModel =
  mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);
