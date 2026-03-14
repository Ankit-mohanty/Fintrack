const Expense = require('../models/Expense');
const AppError = require('../utils/AppError');

// @desc  Get all expenses
// @route GET /api/expenses
// @access Private
const getExpenses = async (req, res, next) => {
  try {
    const { category, startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = { user: req.user.id };

    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const [expenses, total] = await Promise.all([
      Expense.find(query).sort({ date: -1 }).skip(skip).limit(Number(limit)),
      Expense.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: expenses.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      expenses,
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Add expense
// @route POST /api/expenses
// @access Private
const addExpense = async (req, res, next) => {
  try {
    const expense = await Expense.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, expense });
  } catch (err) {
    next(err);
  }
};

// @desc  Update expense
// @route PUT /api/expenses/:id
// @access Private
const updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findById(req.params.id);
    if (!expense) return next(new AppError('Expense not found', 404));
    if (expense.user.toString() !== req.user.id)
      return next(new AppError('Not authorized', 403));

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, expense });
  } catch (err) {
    next(err);
  }
};

// @desc  Delete expense
// @route DELETE /api/expenses/:id
// @access Private
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return next(new AppError('Expense not found', 404));
    if (expense.user.toString() !== req.user.id)
      return next(new AppError('Not authorized', 403));

    await expense.deleteOne();
    res.status(200).json({ success: true, message: 'Expense deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc  Get expense analytics
// @route GET /api/expenses/analytics
// @access Private
const getAnalytics = async (req, res, next) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${year}-12-31T23:59:59`);

    // Monthly spending
    const monthlySpending = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$date' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    // Category distribution
    const categoryBreakdown = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Current month total
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthTotal = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.status(200).json({
      success: true,
      monthlySpending,
      categoryBreakdown,
      currentMonthTotal: monthTotal[0]?.total || 0,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getExpenses, addExpense, updateExpense, deleteExpense, getAnalytics };
