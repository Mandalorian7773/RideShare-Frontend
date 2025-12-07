import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Use the machine's IP address for Android emulator compatibility
const API_BASE_URL = Constants.platform?.android 
  ? 'http://192.168.31.4:3000/api' 
  : 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      await AsyncStorage.setItem('token', response.data.data.token);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (email: string, password: string, role: string, firstName?: string, lastName?: string) => {
  try {
    const response = await api.post('/auth/register', { email, password, role, firstName, lastName });
    if (response.data.success) {
      await AsyncStorage.setItem('token', response.data.data.token);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
    await AsyncStorage.removeItem('token');
  } catch (error) {
    throw error;
  }
};