import axios from 'axios';

export const fetchBalance = async (userId) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/balance/${userId}`);
        return response.data; // { balance: ... }
    } catch (error) {
        console.error('Error fetching balance:', error.response?.data || error.message);
        throw error;
    }
};