// src/config/appUrls.ts
export const APP_URLS = {
  mainDashboard: import.meta.env.VITE_MAIN_DASHBOARD_URL || 'http://localhost/main',
  login: import.meta.env.VITE_LOGIN_APP_URL || 'http://localhost/login',
  staffDashboard: import.meta.env.VITE_DASHBOARD_APP_URL || 'http://localhost/dashboard',
  studentDash: import.meta.env.VITE_STUDENT_APP_URL || 'http://localhost/student',
} as const;