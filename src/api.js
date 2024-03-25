import axios from "axios"
import { IP_ADDRESS } from "./ip";

export const api = () => axios.create({
    baseURL: (IP_ADDRESS && `http://${IP_ADDRESS}:3001`) || 'http://localhost:3001',
    headers: {
        Authorization: "Bearer " + localStorage.getItem('token')
    }
})

export default api;