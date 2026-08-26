import axios from 'axios';

// No trailing fallback to a relative '/api' — if VITE_API_URL is missing,
// fail loudly instead of silently hitting the wrong domain.
const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  console.error(
    'VITE_API_URL is not set. Requests will fail. Set it in your .env file (local) ' +
    'and in Vercel → Settings → Environment Variables (deployed).'
  );
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * 🔒 REQUEST INTERCEPTOR:
 * Automatically reads the synchronized JWT token out of local storage 
 * and injects standard Bearer Authorization headers before leaving the browser.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    // Strip accidental redundant Bearer declarations safely
    const pureToken = token.replace(/^(Bearer\s+)+/i, '').trim();
    config.headers.Authorization = `Bearer ${pureToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

/**
 * 🚪 RESPONSE INTERCEPTOR:
 * If the staff user leaves their panel open and their session expires, 
 * catching a 401/403 error instantly purges local storage and boots them out.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("Staff credential validity expired. Evicting session keys.");
      localStorage.removeItem('jwtToken');
      
      // Force user back to the primary login domain endpoint
      window.location.href = 'https://library-login.vercel.app/login/stafflogin'; 
    }
    return Promise.reject(error);
  }
);

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// === EXAMPLE STAFF NETWORK REQUEST METRICS ===

// Pull Master Book Rosters
export const getBooks = async (): Promise<ApiResponse> => {
  try {
    const response = await api.get('/book/all');
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.error || 'Failed to fetch book files.' };
  }
};

// Create a New Category Record
export const addCategory = async (data: { name: string }): Promise<ApiResponse> => {
  try {
    const response = await api.post('/category/add', data);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.error || 'Failed to establish category.' };
  }
};

export default api;