import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform, Linking, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import SimpleButton from '../components/SimpleButton';

export default function HomeScreen({ navigation }: any) {
  const [location, setLocation] = useState<any>(null);
  const [mapView, setMapView] = useState<any>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(true);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      // Dynamically import react-native-maps only on native platforms
      import('react-native-maps').then((maps) => {
        setMapView({
          MapView: maps.default,
          Marker: maps.Marker
        });
      });
      
      // Get current location or fallback to default
      getLocation();
    }
  }, []);

  const checkLocationServices = async () => {
    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      setLocationServicesEnabled(servicesEnabled);
      return servicesEnabled;
    } catch (error) {
      console.error('Error checking location services:', error);
      setLocationServicesEnabled(false);
      return false;
    }
  };

  const getLocation = async () => {
    try {
      setLocationLoading(true);
      
      // Check if location services are enabled
      const servicesEnabled = await checkLocationServices();
      if (!servicesEnabled) {
        // Use default location when services are disabled
        useDefaultLocation();
        return;
      }
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Use default location when permission is denied
        useDefaultLocation();
        return;
      }

      // Try to get location with timeout
      const locationResult: any = await Promise.race([
        Location.getCurrentPositionAsync({}),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Location request timed out')), 10000)
        )
      ]);
      
      setLocation(locationResult);
      setLocationLoading(false);
    } catch (error: any) {
      console.error('Error getting location:', error);
      setLocationLoading(false);
      
      // Use default location when any error occurs
      useDefaultLocation();
    }
  };

  const useDefaultLocation = () => {
    // Default to San Francisco coordinates
    const defaultLocation = {
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
      }
    };
    
    setLocation(defaultLocation);
    setLocationLoading(false);
  };

  // Web version of the map
  const WebMap = () => (
    <WebView
      style={styles.map}
      source={{ uri: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.1234567890123!2d-74.0059413!3d40.7127753!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQyJzQ2LjAiTiA3NMKwMDAnMjEuNCJX!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus' }}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>RideShare</Text>
      
      {Platform.OS === 'web' ? (
        <WebMap />
      ) : mapView && location ? (
        <mapView.MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <mapView.Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
          />
        </mapView.MapView>
      ) : locationLoading ? (
        <View style={styles.mapPlaceholder}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      ) : (
        <View style={styles.mapPlaceholder}>
          <Text>Map Loading...</Text>
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <SimpleButton 
          title="Search Ride" 
          onPress={() => navigation.navigate('SearchRide')} 
        />
        <SimpleButton 
          title="Offer Ride" 
          onPress={() => navigation.navigate('OfferRide')} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 20,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
});