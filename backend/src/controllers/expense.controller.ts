import { Request, Response } from 'express';
import { createExpenseSchema, updateExpenseSchema } from '../models/expense/expense.schema';
import { logActivity } from '../utils/logger';
import { encrypt, decrypt } from '../utils/crypto/crypto';
import * as expenseService from '../models/expense/expense.service';

export const createExpense = async (req: Request, res: Response) => {
  if (!req.body.data) {
    return res.status(400).json({ message: 'Missing encrypted data payload' });
  }
  if (typeof req.body.data !== 'string') {
    return res.status(400).json({ message: 'Invalid encrypted data format' });
  }

  let parsed;
  try {
    const decrypted = decrypt(req.body.data);
    parsed = JSON.parse(decrypted);
  } catch (err) {
    return res.status(400).json({ message: 'Unable to decrypt or parse data' });
  }

  try {
    const result = createExpenseSchema.safeParse(parsed);
    if (!result.success) {
      return res.status(400).json(result.error.format());
    }

    const newExpense = await expenseService.createExpense((req as any).userId, parsed);

    await logActivity({
      userId: (req as any).userId,
      action: 'CREATE',
      entity: 'Expense',
      targetId: newExpense.id,
      detail: `สร้าง "${newExpense.title}" มูลค่า ${newExpense.amount} บาท`
    });

    res.status(201).json(newExpense);
  } catch (err) {
    console.error('[createExpense ERROR]', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await expenseService.getAllExpenses((req as any).userId);
    
    await logActivity({
      userId: (req as any).userId,
      action: 'READ',
      entity: 'Expense',
      detail: `ดึงข้อมูลรายการรายจ่ายทั้งหมด`
    });

    const decryptedExpenses = expenses.map((e) => ({
      ...e,
      title: decrypt(e.title),
    }));
    const encryptedPayload = encrypt(JSON.stringify(decryptedExpenses));
    res.json({ data: encryptedPayload });
  } catch (err) {
    console.error('[getExpenses ERROR]', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Get a single expense by ID
export const getExpenseById = async (req: Request, res: Response) => {
  const expenseId = parseInt(req.params.id);
  try {
    const expense = await expenseService.getExpenseById((req as any).userId, expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    await logActivity({
      userId: (req as any).userId,
      action: 'READ',
      entity: 'Expense',
      targetId: expense.id,
      detail: `ดูข้อมูลรายการ "${expense.title}"`
    });

    const decrypted = { ...expense, title: decrypt(expense.title) };
    const encryptedPayload = encrypt(JSON.stringify(decrypted));
    res.json({ data: encryptedPayload });
  } catch (err) {
    console.error('[getExpenseById ERROR]', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Update an existing expense
export const updateExpense = async (req: Request, res: Response) => {
  if (!req.body.data) {
    return res.status(400).json({ message: 'Missing encrypted data payload' });
  }
  if (typeof req.body.data !== 'string') {
    return res.status(400).json({ message: 'Invalid encrypted data format' });
  }

  let parsed;
  try {
    const decrypted = decrypt(req.body.data);
    parsed = JSON.parse(decrypted);
  } catch (err) {
    console.error('[updateExpense ERROR]', err);
    return res.status(400).json({ message: 'Unable to decrypt or parse data' });
  }

  const expenseId = parseInt(req.params.id);
  try {
    const result = updateExpenseSchema.safeParse(parsed);
    if (!result.success) {
      return res.status(400).json(result.error.format());
    }

    const updated = await expenseService.updateExpense((req as any).userId, expenseId, parsed);

    await logActivity({
      userId: (req as any).userId,
      action: 'UPDATE',
      entity: 'Expense',
      targetId: updated.id,
      detail: `แก้ไขรายการ "${updated.title}" เป็นมูลค่า ${updated.amount} บาท`
    });

    res.json({ data: encrypt(JSON.stringify(updated)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Delete an expense
export const deleteExpense = async (req: Request, res: Response) => {
  const expenseId = parseInt(req.params.id);
  try {
    const deleted = await expenseService.deleteExpense((req as any).userId, expenseId);

    await logActivity({
      userId: (req as any).userId,
      action: 'DELETE',
      entity: 'Expense',
      targetId: deleted.id,
      detail: `ลบรายการ "${deleted.title}"`
    });

    res.status(200).json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('[deleteExpense ERROR]', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
};