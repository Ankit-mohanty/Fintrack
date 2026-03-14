export const CATEGORY_COLORS = {
  'Food & Dining': '#f59e0b',
  'Shopping': '#ec4899',
  'Transportation': '#3b82f6',
  'Entertainment': '#8b5cf6',
  'Healthcare': '#10b981',
  'Utilities': '#06b6d4',
  'Rent & Housing': '#ef4444',
  'Education': '#6366f1',
  'Travel': '#f97316',
  'Subscriptions': '#a855f7',
  'Investments': '#22c55e',
  'Other': '#6b7280',
};

export const CATEGORY_ICONS = {
  'Food & Dining': '🍕',
  'Shopping': '🛍️',
  'Transportation': '🚗',
  'Entertainment': '🎮',
  'Healthcare': '💊',
  'Utilities': '💡',
  'Rent & Housing': '🏠',
  'Education': '📚',
  'Travel': '✈️',
  'Subscriptions': '📱',
  'Investments': '📈',
  'Other': '💰',
};

export const SUBSCRIPTION_LOGOS = {
  'Netflix': { icon: '🎬', color: '#e50914' },
  'Spotify': { icon: '🎵', color: '#1db954' },
  'Amazon Prime': { icon: '📦', color: '#ff9900' },
  'Disney+': { icon: '🏰', color: '#113ccf' },
  'YouTube Premium': { icon: '▶️', color: '#ff0000' },
  'Apple Music': { icon: '🎶', color: '#fc3c44' },
  'Microsoft 365': { icon: '💼', color: '#0078d4' },
  'Adobe Creative': { icon: '🎨', color: '#ff0000' },
  'Hotstar': { icon: '⭐', color: '#1f80e0' },
  'Zee5': { icon: '🎭', color: '#5f26ee' },
  'SonyLIV': { icon: '📺', color: '#0046ae' },
  'Default': { icon: '📋', color: '#6366f1' },
};

export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const getDaysUntil = (date) => {
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const getMonthlyEquivalent = (amount, cycle) => {
  switch (cycle) {
    case 'weekly': return amount * 4;
    case 'monthly': return amount;
    case 'quarterly': return amount / 3;
    case 'yearly': return amount / 12;
    default: return amount;
  }
};
