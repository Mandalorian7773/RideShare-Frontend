import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

let socket: Socket | null = null;

export const connectSocket = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    if (socket) {
      socket.disconnect();
    }

    // Use the machine's IP address for Android emulator compatibility
    const SOCKET_URL = Constants.platform?.android 
      ? 'http://192.168.31.4:3000' 
      : 'http://localhost:3000';

    socket = io(SOCKET_URL, {
      auth: {
        token: token
      }
    });

    return socket;
  } catch (error) {
    console.error('Error connecting to socket:', error);
    throw error;
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinRoom = (roomId: string) => {
  if (socket) {
    socket.emit('join_room', roomId);
  }
};

export const sendMessage = (roomId: string, content: string) => {
  if (socket) {
    socket.emit('send_message', {
      roomId,
      content
    });
  }
};

export const onReceiveMessage = (callback: (message: any) => void) => {
  if (socket) {
    socket.on('receive_message', callback);
  }
};

export const offReceiveMessage = () => {
  if (socket) {
    socket.off('receive_message');
  }
};