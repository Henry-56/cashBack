import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// External way to trigger loading without hooks (for axios)
let loadingCallback: (show: boolean) => void = () => { };
export const setOnLoadingChange = (cb: (show: boolean) => void) => {
    loadingCallback = cb;
};

api.interceptors.request.use((config) => {
    // Check if we should skip the loading overlay
    if (!(config as any).skipLoader) {
        loadingCallback(true);
    }

    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => {
        loadingCallback(false);
        return response;
    },
    (error) => {
        loadingCallback(false);
        return Promise.reject(error);
    }
);

export default api;
