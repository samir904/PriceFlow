import axios from 'axios'
// ✅ CORRECT - Use backend URL
const api = axios.create({
    // baseURL: 'http://localhost:5014/api/v1',  // ← CORRECT!
    // baseURL: 'https://priceflow-backend.onrender.com/api/v1',
     baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5014/api/v1',

    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});



// REQUEST INTERCEPTOR - Add token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('📤 API Request:', config.method.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// RESPONSE INTERCEPTOR - Handle responses
api.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('❌ Response Error:', error.response?.status, error.message);
        
        // Handle 401 - Token expired
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

export default api;
