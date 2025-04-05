import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Check if running in a browser (React Native Web) or mobile
const isWeb = typeof window !== "undefined" && window.document;

// Environment config (works for both localhost & ngrok)
const ENVIRONMENTS = {
  LOCAL: {
    baseURL: "http://localhost:8000/api",
    name: "local",
  },
  NGROK: {
    baseURL: "https://3eb9-2405-201-f009-e13d-fd8d-2c4d-5878-e72d.ngrok-free.app/api",
    name: "ngrok",
  },
};

// Use ngrok for mobile, localhost for web (or vice versa)
const CURRENT_ENV = isWeb ? ENVIRONMENTS.LOCAL : ENVIRONMENTS.NGROK;

// Base API instance
const api = axios.create({
  baseURL: CURRENT_ENV.baseURL,
  headers: {
    "Content-Type": "application/json",
    ...(!isWeb && { "ngrok-skip-browser-warning": "69420" }), // Only add for mobile/ngrok
  },
});

// Auth API instance (with token interceptor)
export const apiAuth = axios.create({
  baseURL: CURRENT_ENV.baseURL,
  headers: {
    "Content-Type": "application/json",
    ...(!isWeb && { "ngrok-skip-browser-warning": "69420" }),
  },
});

apiAuth.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;