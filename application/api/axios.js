import axios from 'axios';

const API_BASE_URL = 'https://c1ca-2409-40f3-2048-cf13-ac1b-ee68-c148-de52.ngrok-free.app/api/'; // Replace with your actual backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
