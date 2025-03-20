// import axios from "axios"

// export const BASE_SERVER_URL = 'http://' + IP_ADDRESS + ':3001'; // Replace with your actual base URL
const USE_LOCALHOST_SERVER = process.env.NODE_ENV === 'development'
export const BASE_SERVER_URL = USE_LOCALHOST_SERVER ? process.env.REACT_APP_BASE_URL_LOCALHOST : process.env.REACT_APP_BASE_URL; // Replace with your actual base URL

export const api = () => {
    const token = localStorage.getItem('token');
    const learningLanguage = localStorage.getItem('learningLanguage') || 'en';

    const headers = {
        'Content-Type': 'application/json',
        'learningLanguage': learningLanguage,
        'Authorization': token ? `Bearer ${token}` : undefined
    };

    return {
        get: (url, config = {}) => fetch(`${BASE_SERVER_URL}${url}`, { headers, ...config }).then((result) => result.json()),
        post: (url, data, config = {}) => fetch(`${BASE_SERVER_URL}${url}`, { method: 'POST', body: JSON.stringify(data), headers, ...config }).then((result) => result.json()),
        put: (url, data, config = {}) => fetch(`${BASE_SERVER_URL}${url}`, { method: 'PUT', body: JSON.stringify(data), headers, ...config }).then((result) => result.json()),
        delete: (url, config = {}) => fetch(`${BASE_SERVER_URL}${url}`, { method: 'DELETE', headers, ...config }).then((result) => result.json())
    };
};

export default api;