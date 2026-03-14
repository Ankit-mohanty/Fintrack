const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Subscription name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    billingCycle: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
      default: 'monthly',
    },
    category: {
      type: String,
      enum: [
        'Streaming',
        'Music',
        'Gaming',
        'Productivity',
        'Cloud Storage',
        'Health & Fitness',
        'News & Media',
        'Education',
        'Software',
        'Other',
      ],
      default: 'Other',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    nextBillingDate: {
      type: Date,
      required: [true, 'Next billing date is required'],
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'cancelled'],
      default: 'active',
    },
    logo: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    notes: {
      type: String,
      maxlength: [300, 'Notes cannot exceed 300 characters'],
    },
    reminderDays: {
      type: Number,
      default: 3,
      min: 0,
      max: 30,
    },
  },
  { timestamps: true }
);

subscriptionSchema.index({ user: 1, nextBillingDate: 1 });
subscriptionSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
