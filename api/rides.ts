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

export const searchRides = async (latitude: number, longitude: number, radius: number = 10, timeWindow: number = 60) => {
  try {
    const response = await api.post('/rides/search', { latitude, longitude, radius, timeWindow });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createRide = async (rideData: any) => {
  try {
    const response = await api.post('/rides/create', rideData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const requestRide = async (rideId: number) => {
  try {
    const response = await api.post('/rides/request', { rideId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCurrentRides = async () => {
  try {
    const response = await api.get('/rides/current');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPastRides = async () => {
  try {
    const response = await api.get('/rides/past');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUpcomingRides = async () => {
  try {
    const response = await api.get('/rides/upcoming');
    return response.data;
  } catch (error) {
    throw error;
  }
};