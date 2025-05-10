import { z } from 'zod';

// This schema is used to validate the structure of a new expense before creating it
export const createExpenseSchema = z.object({
    // Title must be a non-empty string
    title: z.string().min(1),

    // Amount must be a positive number
    amount: z.number().positive(),

    // Category is optional and should be a string if provided
    category: z.string().optional(),

    // Date must be a valid ISO date string
    date: z.string().refine((val: string) => !isNaN(Date.parse(val)), {
        message: "Invalid date format"
    })
});