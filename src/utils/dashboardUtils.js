// Dashboard utility functions for data formatting and calculations

/**
 * Format currency amount
 * @param {number|string} amount - The amount to format
 * @param {string} currency - Currency symbol (default: '$')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = '$') => {
  const numAmount = parseFloat(amount) || 0;
  return `${currency}${numAmount.toFixed(2)}`;
};

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  try {
    return new Date(date).toLocaleDateString('en-US', defaultOptions);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'Never';
  
  try {
    const now = new Date();
    const targetDate = new Date(date);
    const diffInSeconds = Math.floor((now - targetDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return formatDate(date);
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return 'Unknown';
  }
};

/**
 * Calculate user statistics from data array
 * @param {Array} users - Array of user objects
 * @returns {object} Statistics object
 */
export const calculateUserStats = (users) => {
  if (!Array.isArray(users)) {
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalBalance: 0,
      averageBalance: 0,
      newToday: 0,
      newThisWeek: 0,
      premiumUsers: 0,
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const stats = users.reduce((acc, user) => {
    const userDate = new Date(user.created_at);
    const balance = parseFloat(user.balance) || 0;
    
    acc.totalBalance += balance;
    
    if (user.status === 'active') acc.activeUsers++;
    if (user.role === 'Premium User') acc.premiumUsers++;
    if (userDate >= today) acc.newToday++;
    if (userDate >= weekAgo) acc.newThisWeek++;
    
    return acc;
  }, {
    totalUsers: users.length,
    activeUsers: 0,
    totalBalance: 0,
    premiumUsers: 0,
    newToday: 0,
    newThisWeek: 0,
  });

  stats.averageBalance = stats.totalUsers > 0 ? stats.totalBalance / stats.totalUsers : 0;

  return stats;
};

/**
 * Get user status color for UI components
 * @param {string} status - User status
 * @returns {string} Color name for Material-UI
 */
export const getUserStatusColor = (status) => {
  const statusColors = {
    active: 'success',
    inactive: 'warning',
    suspended: 'error',
    pending: 'info',
  };
  
  return statusColors[status?.toLowerCase()] || 'default';
};

/**
 * Get role color for UI components
 * @param {string} role - User role
 * @returns {string} Color name for Material-UI
 */
export const getRoleColor = (role) => {
  const roleColors = {
    'Premium User': 'primary',
    'Admin': 'error',
    'Moderator': 'warning',
    'User': 'default',
  };
  
  return roleColors[role] || 'default';
};

/**
 * Filter users based on search criteria
 * @param {Array} users - Array of user objects
 * @param {string} searchTerm - Search term
 * @param {Array} fields - Fields to search in
 * @returns {Array} Filtered users
 */
export const filterUsers = (users, searchTerm, fields = ['name', 'email', 'role']) => {
  if (!searchTerm || !Array.isArray(users)) return users;
  
  const term = searchTerm.toLowerCase();
  
  return users.filter(user => 
    fields.some(field => 
      user[field]?.toLowerCase().includes(term)
    )
  );
};

/**
 * Sort users by field
 * @param {Array} users - Array of user objects
 * @param {string} field - Field to sort by
 * @param {string} direction - Sort direction ('asc' or 'desc')
 * @returns {Array} Sorted users
 */
export const sortUsers = (users, field, direction = 'asc') => {
  if (!Array.isArray(users)) return users;
  
  return [...users].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];
    
    // Handle numeric fields
    if (field === 'balance') {
      aVal = parseFloat(aVal) || 0;
      bVal = parseFloat(bVal) || 0;
    }
    
    // Handle date fields
    if (field === 'created_at' || field === 'last_sign_in') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }
    
    // Handle string fields
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (direction === 'desc') {
      return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
    }
    
    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
  });
};














