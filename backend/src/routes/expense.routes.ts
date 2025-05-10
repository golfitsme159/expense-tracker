import { Router } from 'express';
import { createExpense, getExpenses } from '../controllers/expense.controller';
import verifyToken from '../middlewares/verifyToken';

const router = Router();

router.use(verifyToken);
router.post('/', createExpense);
router.get('/', getExpenses);

export default router;