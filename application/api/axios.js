import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Environment configuration
const ENVIRONMENTS = {
  LOCAL: {
    baseURL: "http://localhost:8000/api",
    name: "local"
  },
  NGROK: {
    baseURL: "https://ce0c-2405-201-f009-e13d-cfe-10d9-651-7942.ngrok-free.app/api",
    name: "ngrok"
  }
};

// Select environment here (change this to switch between environments)
const CURRENT_ENV = ENVIRONMENTS.NGROK; // or ENVIRONMENTS.LOCAL

console.log(`Using ${CURRENT_ENV.name} environment: ${CURRENT_ENV.baseURL}`);

// Create axios instance with the selected environment
const api = axios.create({
  baseURL: CURRENT_ENV.baseURL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true" // Only needed for ngrok
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.config.url, error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// Create authenticated axios instance
export const apiAuth = axios.create({
  baseURL: CURRENT_ENV.baseURL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true" // Only needed for ngrok
  },
});

// Request interceptor for auth tokens
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

// Export the current environment for debugging
export const currentEnvironment = CURRENT_ENV.name;
export const apiBaseUrl = CURRENT_ENV.baseURL;

export default api;