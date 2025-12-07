import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

import EmailLoginScreen from './screens/EmailLoginScreen';
import EmailSignupScreen from './screens/EmailSignupScreen';
import HomeScreen from './screens/HomeScreen';
import SearchRideScreen from './screens/SearchRideScreen';
import OfferRideScreen from './screens/OfferRideScreen';
import RideDetailsScreen from './screens/RideDetailsScreen';
import CurrentRidesScreen from './screens/CurrentRidesScreen';
import PastRidesScreen from './screens/PastRidesScreen';
import ProfileScreen from './screens/ProfileScreen';
import ChatScreen from './screens/ChatScreen';

import { AuthProvider, useAuth } from './utils/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const AuthStack = createStackNavigator();
const RidesStack = createStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="EmailLogin" component={EmailLoginScreen} />
      <AuthStack.Screen name="EmailSignup" component={EmailSignupScreen} />
    </AuthStack.Navigator>
  );
}

function RidesNavigator() {
  return (
    <RidesStack.Navigator>
      <RidesStack.Screen name="CurrentRides" component={CurrentRidesScreen} options={{ title: 'Current Rides' }} />
      <RidesStack.Screen name="PastRides" component={PastRidesScreen} options={{ title: 'Past Rides' }} />
    </RidesStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="SearchRide" component={SearchRideScreen} />
      <Tab.Screen name="OfferRide" component={OfferRideScreen} />
      <Tab.Screen name="Rides" component={RidesNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MainNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="RideDetails" component={RideDetailsScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}

function AppNavigator() {
  const [initializing, setInitializing] = useState(true);
  const { isAuthenticated, token } = useAuth();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If we're already authenticated through the context, we're done
        if (isAuthenticated && token) {
          setInitializing(false);
          return;
        }
        
        // Check for stored token
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          // Validate the token by trying to decode it
          try {
            jwtDecode(storedToken);
            // If we get here, the token is valid
            setInitializing(false);
            return;
          } catch (decodeError) {
            // Invalid token, remove it
            await AsyncStorage.removeItem('token');
          }
        }
        setInitializing(false);
      } catch (error) {
        console.error('Error checking auth:', error);
        setInitializing(false);
      }
    };
    
    checkAuth();
  }, []);
  
  if (initializing) {
    return <LoadingScreen />;
  }
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated && token ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});