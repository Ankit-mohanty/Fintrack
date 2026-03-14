const Subscription = require('../models/Subscription');
const AppError = require('../utils/AppError');

// @desc  Get all subscriptions
// @route GET /api/subscriptions
// @access Private
const getSubscriptions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { user: req.user.id };
    if (status) query.status = status;

    const subscriptions = await Subscription.find(query).sort({ nextBillingDate: 1 });
    const totalMonthly = subscriptions
      .filter((s) => s.status === 'active')
      .reduce((acc, s) => {
        if (s.billingCycle === 'monthly') return acc + s.amount;
        if (s.billingCycle === 'yearly') return acc + s.amount / 12;
        if (s.billingCycle === 'quarterly') return acc + s.amount / 3;
        if (s.billingCycle === 'weekly') return acc + s.amount * 4;
        return acc;
      }, 0);

    res.status(200).json({ success: true, subscriptions, totalMonthly: Math.round(totalMonthly * 100) / 100 });
  } catch (err) {
    next(err);
  }
};

// @desc  Add subscription
// @route POST /api/subscriptions
// @access Private
const addSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, subscription });
  } catch (err) {
    next(err);
  }
};

// @desc  Update subscription
// @route PUT /api/subscriptions/:id
// @access Private
const updateSubscription = async (req, res, next) => {
  try {
    let sub = await Subscription.findById(req.params.id);
    if (!sub) return next(new AppError('Subscription not found', 404));
    if (sub.user.toString() !== req.user.id) return next(new AppError('Not authorized', 403));

    sub = await Subscription.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, subscription: sub });
  } catch (err) {
    next(err);
  }
};

// @desc  Delete subscription
// @route DELETE /api/subscriptions/:id
// @access Private
const deleteSubscription = async (req, res, next) => {
  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return next(new AppError('Subscription not found', 404));
    if (sub.user.toString() !== req.user.id) return next(new AppError('Not authorized', 403));

    await sub.deleteOne();
    res.status(200).json({ success: true, message: 'Subscription deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc  Get upcoming renewals (within next N days)
// @route GET /api/subscriptions/upcoming
// @access Private
const getUpcoming = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    const upcoming = await Subscription.find({
      user: req.user.id,
      status: 'active',
      nextBillingDate: { $gte: now, $lte: future },
    }).sort({ nextBillingDate: 1 });

    res.status(200).json({ success: true, upcoming });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSubscriptions, addSubscription, updateSubscription, deleteSubscription, getUpcoming };
