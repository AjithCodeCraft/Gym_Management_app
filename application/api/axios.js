import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'https://c1ca-2409-40f3-2048-cf13-ac1b-ee68-c148-de52.ngrok-free.app/api/'; // Replace with your actual backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiAuth = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in the headers
apiAuth.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`; // Use `Token` or `Bearer` based on your backend
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;