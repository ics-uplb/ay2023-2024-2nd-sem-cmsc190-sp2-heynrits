import axios from 'axios';

const a = axios.create({
    baseURL: process.env.API_BASE_URL || 'httpsss://localhost:30001/api/',
})

a.interceptors.request.use(function (config) {
    const withAuth = config.headers.withAuth || false;

    if (withAuth) {
        const token = localStorage.getItem('token');
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default a;