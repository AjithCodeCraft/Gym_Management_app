import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE_URL = "https://024d-2409-40f3-201f-1b81-946b-2855-3724-8378.ngrok-free.app/api/"; // Replace with your actual backend URL


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
