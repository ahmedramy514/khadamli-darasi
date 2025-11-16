// ملف الإعدادات الرئيسي للتطبيق

export const APP_CONFIG = {
  APP_NAME: 'خدملي دراسي',
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  THEME: {
    PRIMARY: '#007bff',
    SECONDARY: '#6c757d',
    SUCCESS: '#28a745',
    DANGER: '#dc3545',
    WARNING: '#ffc107',
    INFO: '#17a2b8',
  },
  FEATURES: {
    ENABLE_NOTIFICATIONS: true,
    ENABLE_DARK_MODE: true,
    ENABLE_LEADERBOARD: true,
  },
};

export default APP_CONFIG;
