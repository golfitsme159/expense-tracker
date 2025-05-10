import prisma from '../../../prisma/client';
import { CreateExpenseDto, UpdateExpenseDto } from './expense.dto';

export const createExpense = (userId: number, data: CreateExpenseDto) => {
    return prisma.expense.create({
        data: {
            ...data,
            userId,
        },
    });
};

export const getAllExpenses = (userId: number) => {
    return prisma.expense.findMany({
        where: { userId },
    });
};

export const getExpenseById = (userId: number, id: number) => {
    return prisma.expense.findUnique({
        where: { id, userId },
    });
};

export const updateExpense = (userId: number, id: number, data: UpdateExpenseDto) => {
    return prisma.expense.update({
        where: { id, userId },
        data,
    });
};

export const deleteExpense = (userId: number, id: number) => {
    return prisma.expense.delete({
        where: { id, userId },
    });
};
