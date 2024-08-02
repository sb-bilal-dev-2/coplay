import axios from "axios"

// export const BASE_SERVER_URL = 'http://' + IP_ADDRESS + ':3001'; // Replace with your actual base URL
const USE_LOCALHOST_SERVER = process.env.NODE_ENV === 'development'
export const BASE_SERVER_URL = USE_LOCALHOST_SERVER ? process.env.REACT_APP_BASE_URL_LOCALHOST : process.env.REACT_APP_BASE_URL; // Replace with your actual base URL

export const api = () => {
    return axios.create({
        baseURL: BASE_SERVER_URL,
        headers: {
            learningLanguage: localStorage.getItem('learningLanguage') || 'en',
            Authorization: "Bearer " + localStorage.getItem('token')
        }
    })
}

export default api;