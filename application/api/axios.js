import axios from 'axios';

const API_BASE_URL = 'https://3d22-2409-40f3-201c-210a-59cd-5979-a31d-d70d.ngrok-free.app/api/'; // Replace with your actual backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
