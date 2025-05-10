import { Request, Response } from 'express';
import prisma from '../../prisma/client';
import { createExpenseSchema } from '../models/expense/expense.schema';

export const createExpense = async (req: Request, res: Response) => {
  try {
    const result = createExpenseSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error.format());
    }

    const newExpense = await prisma.expense.create({
      data: {
        ...result.data,
        userId: (req as any).userId,
      },
    });

    res.status(201).json(newExpense);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getExpenses = async (req: Request, res: Response) => {
  const expenses = await prisma.expense.findMany({
    where: { userId: (req as any).userId },
  });
  res.json(expenses);
};