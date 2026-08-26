// src/config/appUrls.ts

// 1. Export the API URL string directly as APP_URLS
console.log("🔍 Checking VITE_API_URL value:", import.meta.env.VITE_API_URL);
export const APP_URLS =  'https://library-backend-d1a4.onrender.com';

// 2. Keep the other dashboard links accessible under a different name if needed
export const DASHBOARD_URLS = {
  mainDashboard: import.meta.env.VITE_MAIN_DASHBOARD_URL || 'http://localhost/main',
  login: import.meta.env.VITE_LOGIN_APP_URL || 'http://localhost/login',
  staffDashboard: import.meta.env.VITE_DASHBOARD_APP_URL || 'http://localhost/dashboard',
  studentDash: import.meta.env.VITE_STUDENT_APP_URL || 'http://localhost/student',
} as const;
