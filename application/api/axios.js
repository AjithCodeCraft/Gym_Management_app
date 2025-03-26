import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/"; // Replace with your actual backend URL
//const API_BASE_URL = "https://0db9-103-160-233-161.ngrok-free.app/api/"

const api = axios.create({
   baseURL: API_BASE_URL,
   headers: {
      "Content-Type": "application/json",
   },
});

export const apiAuth = axios.create({
   baseURL: API_BASE_URL,
   headers: {
      "Content-Type": "application/json",
   },
});

apiAuth.interceptors.request.use(
   async (config) => {
      const token = await AsyncStorage.getItem("access_token");
      if (token) {
         config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
   },
   (error) => {
      return Promise.reject(error);
   }
);

export default api;
