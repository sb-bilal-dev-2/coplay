import axios from "axios"
import { IP_ADDRESS } from './ip';

// export const BASE_SERVER_URL = 'http://' + IP_ADDRESS + ':3001'; // Replace with your actual base URL
export const BASE_SERVER_URL = process.env.REACT_APP_BASE_URL; // Replace with your actual base URL

export const api = () => {
    return axios.create({
        baseURL: BASE_SERVER_URL,
        headers: {
            Authorization: "Bearer " + localStorage.getItem('token')
        }
    })
}

export default api;