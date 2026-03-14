const Expense = require('../models/Expense');
const Subscription = require('../models/Subscription');

// @desc  Get dashboard summary
// @route GET /api/dashboard
// @access Private
const getDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      currentMonthExpenses,
      lastMonthExpenses,
      activeSubscriptions,
      upcomingRenewals,
      recentExpenses,
      categoryBreakdown,
    ] = await Promise.all([
      Expense.aggregate([
        { $match: { user: req.user._id, date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { user: req.user._id, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Subscription.find({ user: req.user.id, status: 'active' }),
      Subscription.find({
        user: req.user.id,
        status: 'active',
        nextBillingDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 86400000) },
      }).sort({ nextBillingDate: 1 }),
      Expense.find({ user: req.user.id }).sort({ date: -1 }).limit(5),
      Expense.aggregate([
        { $match: { user: req.user._id, date: { $gte: startOfMonth } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const currentTotal = currentMonthExpenses[0]?.total || 0;
    const lastTotal = lastMonthExpenses[0]?.total || 0;
    const monthChange = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0;

    const monthlySubTotal = activeSubscriptions.reduce((acc, s) => {
      if (s.billingCycle === 'monthly') return acc + s.amount;
      if (s.billingCycle === 'yearly') return acc + s.amount / 12;
      if (s.billingCycle === 'quarterly') return acc + s.amount / 3;
      if (s.billingCycle === 'weekly') return acc + s.amount * 4;
      return acc;
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        currentMonthSpending: currentTotal,
        lastMonthSpending: lastTotal,
        monthChangePercent: Math.round(monthChange * 100) / 100,
        activeSubscriptionsCount: activeSubscriptions.length,
        monthlySubscriptionCost: Math.round(monthlySubTotal * 100) / 100,
        upcomingRenewals,
        recentExpenses,
        categoryBreakdown,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
