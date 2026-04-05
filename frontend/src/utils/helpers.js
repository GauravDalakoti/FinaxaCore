export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateInput = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

export const categoryColors = {
  salary: '#10b981',
  freelance: '#00d4ff',
  investment: '#8b5cf6',
  business: '#f59e0b',
  rent: '#f43f5e',
  utilities: '#64748b',
  food: '#fb923c',
  transport: '#38bdf8',
  healthcare: '#a78bfa',
  education: '#34d399',
  entertainment: '#f472b6',
  shopping: '#fbbf24',
  other: '#94a3b8',
};

export const categoryIcons = {
  salary: '💼',
  freelance: '💻',
  investment: '📈',
  business: '🏢',
  rent: '🏠',
  utilities: '⚡',
  food: '🍽️',
  transport: '🚗',
  healthcare: '🏥',
  education: '📚',
  entertainment: '🎬',
  shopping: '🛍️',
  other: '📋',
};

export const CATEGORIES = [
  'salary', 'freelance', 'investment', 'business',
  'rent', 'utilities', 'food', 'transport',
  'healthcare', 'education', 'entertainment', 'shopping', 'other',
];

export const ROLES = ['viewer', 'analyst', 'admin'];

export const canManageRecords = (role) => role === 'admin';
export const canViewAnalytics = (role) => ['analyst', 'admin'].includes(role);
export const canManageUsers = (role) => role === 'admin';