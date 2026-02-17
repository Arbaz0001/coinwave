import axios from 'axios';
import { API_CONFIG } from "../config/api.config";
const API_URL = API_CONFIG.API_BASE;

export const fetchBalance = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/balance/${userId}`);
        return response.data; // { balance: ... }
    } catch (error) {
        console.error("Error fetching balance:", error.response?.data || error.message);
        throw error;
    }
};