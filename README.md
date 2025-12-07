# RideShare-v3

A simple carpool matching mobile application built with React Native and Expo.

## Features

- Phone number authentication with OTP
- Map-based ride searching and offering
- Ride management (current and past rides)
- In-app messaging with drivers
- User profile management

## Tech Stack

- React Native with Expo
- TypeScript
- React Navigation for routing
- Axios for API calls
- Socket.IO for real-time chat
- AsyncStorage for local storage
- react-native-maps for map display
- expo-location for geolocation

## Folder Structure

```
src/
├── api/          # API service functions
├── components/   # Reusable UI components
├── hooks/        # Custom hooks
├── screens/      # Screen components
└── utils/        # Utility functions and context providers
```

## Installation

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm start` to start the development server

## Available Scripts

- `npm start` - Start the development server
- `npm run android` - Start the app on Android
- `npm run ios` - Start the app on iOS
- `npm run web` - Start the app on web

## Dependencies

- expo
- react-native
- react-navigation
- axios
- socket.io-client
- react-native-maps
- expo-location
- @react-native-async-storage/async-storage