export interface CreateExpenseDto {
    title: string;
    amount: number;
    category?: string;
    date: string; // ISO string
}

export interface Expense {
    id: number;
    title: string;
    amount: number;
    category?: string;
    date: string;
    userId: number;
}

export interface UpdateExpenseDto {
    title?: string;
    amount?: number;
    category?: string;
    date?: string;
}