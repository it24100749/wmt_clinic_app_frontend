import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Using a placeholder - the tunnel will handle the connection
const BASE_URL = "https://wmt-clinic-app.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// Attach token to every request automatically
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
