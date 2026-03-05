import axios from 'axios';

// Get API URL from Environment Variables (Production) OR default to localhost (Development)
// In production on Vercel, VITE_API_URL is empty → relative same-origin calls (routed by vercel.json)
// In local dev, VITE_API_URL=http://localhost:5001 → direct local server
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Configure Request Interceptor (Run before every API request)
api.interceptors.request.use(
    (config) => {
        // Try to get auth token from either local storage location (backward compatibility)
        let token = localStorage.getItem('token');
        if (!token) {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                try {
                    token = JSON.parse(userInfo).token;
                } catch (error) {
                    console.error('Failed to parse userInfo:', error);
                }
            }
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Configure Response Interceptor (Run after every API response)
api.interceptors.response.use(
    (response) => response, // Successfully received response
    (error) => {
        // Handle common global errors here
        if (error.response?.status === 401) {
            console.error('Unauthorized! Token expired or invalid.');
            // Optionally auto-logout user: localStorage.removeItem('token');
        } else if (error.code === 'ERR_NETWORK') {
            console.error('Network error! Please check if the backend is running and CORS is configured.');
        } else if (error.response?.status >= 500) {
            console.error('Server error on backend!', error.response.data);
        }

        return Promise.reject(error);
    }
);

export default api;
