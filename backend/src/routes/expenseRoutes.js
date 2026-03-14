const express = require('express');
const { getExpenses, addExpense, updateExpense, deleteExpense, getAnalytics } = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/analytics', getAnalytics);
router.route('/').get(getExpenses).post(addExpense);
router.route('/:id').put(updateExpense).delete(deleteExpense);

module.exports = router;
