import axios from 'axios'
import { getAuthStoreState } from '@/stores/auth'
import { isTokenExpired } from '@/lib/token';
import { environments } from '@/config/environments';

const axiosInstance = axios.create({
    baseURL: environments.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
    const authState = getAuthStoreState();

    if (authState?.expires_in && isTokenExpired(authState.expires_in)) {
        authState.logout();

        return Promise.reject(new Error('Token expired'));
    }

    if (authState.access_token) {
        config.headers.Authorization = `Bearer ${authState.access_token}`;
    }

    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const authState = getAuthStoreState();
        const isInvalidToken =
            error.response?.status === 401 &&
            error.response?.data?.code === 'invalid_token';

        if (isInvalidToken && authState.isLoggedIn) {
            authState.logout();
        }

        return Promise.reject(error);
    },
);

export default axiosInstance