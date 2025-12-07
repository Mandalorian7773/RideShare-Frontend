import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Dimensions, Platform, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import LocationPicker from '../components/LocationPicker';
import SimpleButton from '../components/SimpleButton';
import RideCard from '../components/RideCard';
import { searchRides } from '../api/rides';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function SearchRideScreen({ navigation }: any) {
  const [pickup, setPickup] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapRegion, setMapRegion] = useState<any>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });
  const [mapView, setMapView] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(true);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      // Dynamically import react-native-maps only on native platforms
      import('react-native-maps').then((maps) => {
        setMapView({
          MapView: maps.default,
          Marker: maps.Marker,
          Polyline: maps.Polyline
        });
      });
      
      // Get current location
      getCurrentLocation();
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

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      
      // Check if location services are enabled
      const servicesEnabled = await checkLocationServices();
      if (!servicesEnabled) {
        Alert.alert(
          'Location Services Disabled',
          'Location services are disabled on your device. Please enable location services in your device settings and try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        setLocationLoading(false);
        return;
      }
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied', 
          'Location permission is required to find nearby rides. You can still manually enter pickup and destination locations.',
          [{ text: 'OK' }]
        );
        setLocationLoading(false);
        return;
      }

      // Try to get location with timeout
      const locationResult: any = await Promise.race([
        Location.getCurrentPositionAsync({}),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Location request timed out')), 10000)
        )
      ]);
      
      setCurrentLocation(locationResult);
      
      // Set initial map region to current location
      setMapRegion({
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
      
      setLocationLoading(false);
    } catch (error: any) {
      console.error('Error getting location:', error);
      setLocationLoading(false);
      
      if (error.message === 'Location request timed out') {
        Alert.alert(
          'Location Timeout', 
          'Unable to get your current location within the time limit. You can still manually enter pickup and destination locations.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Location Unavailable', 
          'Unable to get your current location. You can still manually enter pickup and destination locations.\n\nPlease check:\n• Location services are enabled\n• You have granted location permissions\n• Your device has GPS capability',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleSearch = async () => {
    if (!pickup || !destination) {
      Alert.alert('Error', 'Please select both pickup and destination locations');
      return;
    }

    try {
      setLoading(true);
      // Search rides near the pickup location with a 20km radius and 120 minute time window
      const response = await searchRides(
        pickup.latitude,
        pickup.longitude,
        20,
        120
      );
      
      if (response.success) {
        setRides(response.data.map((item: any) => item.ride));
      } else {
        Alert.alert('Error', response.error || 'Failed to search rides');
      }
    } catch (error: any) {
      console.error('Error searching rides:', error);
      Alert.alert('Error', error.message || 'Failed to search rides');
    } finally {
      setLoading(false);
    }
  };

  const handleRidePress = (ride: any) => {
    navigation.navigate('RideDetails', { rideId: ride.id });
  };

  // Update map region when pickup location is selected
  const handlePickupSelect = (location: any) => {
    setPickup(location);
    setMapRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    });
  };

  // Update map region when destination location is selected
  const handleDestinationSelect = (location: any) => {
    setDestination(location);
    // If pickup is already selected, fit both markers on the map
    if (pickup) {
      const minLat = Math.min(pickup.latitude, location.latitude);
      const maxLat = Math.max(pickup.latitude, location.latitude);
      const minLng = Math.min(pickup.longitude, location.longitude);
      const maxLng = Math.max(pickup.longitude, location.longitude);
      
      const latitudeDelta = (maxLat - minLat) * 1.5;
      const longitudeDelta = (maxLng - minLng) * 1.5;
      
      setMapRegion({
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: latitudeDelta || LATITUDE_DELTA,
        longitudeDelta: longitudeDelta || LONGITUDE_DELTA,
      });
    } else {
      setMapRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
    }
  };

  // Set pickup to current location
  const setPickupToCurrentLocation = async () => {
    if (currentLocation) {
      const locationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        address: 'Current Location'
      };
      handlePickupSelect(locationData);
    } else {
      // Try to get location again
      await getCurrentLocation();
      if (currentLocation) {
        const locationData = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          address: 'Current Location'
        };
        handlePickupSelect(locationData);
      } else {
        Alert.alert('Location Not Available', 'Please enable location services and try again.');
      }
    }
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
      <Text style={styles.title}>Search Ride</Text>
      
      <ScrollView style={styles.contentContainer}>
        <View style={styles.section}>
          <LocationPicker 
            placeholder="Pickup Location" 
            onLocationSelect={handlePickupSelect} 
          />
          {locationLoading ? (
            <View style={styles.locationLoadingContainer}>
              <ActivityIndicator size="small" color="#000" />
              <Text style={styles.locationLoadingText}>Getting your location...</Text>
            </View>
          ) : (
            <SimpleButton 
              title="Use Current Location" 
              onPress={setPickupToCurrentLocation} 
              style={styles.currentLocationButton}
              disabled={!locationServicesEnabled}
            />
          )}
        </View>
        
        <View style={styles.section}>
          <LocationPicker 
            placeholder="Destination" 
            onLocationSelect={handleDestinationSelect} 
          />
        </View>
        
        <View style={styles.mapContainer}>
          {Platform.OS === 'web' ? (
            <WebMap />
          ) : mapView ? (
            <mapView.MapView
              style={styles.map}
              region={mapRegion}
            >
              {pickup && (
                <mapView.Marker
                  coordinate={{
                    latitude: pickup.latitude,
                    longitude: pickup.longitude,
                  }}
                  title="Pickup"
                  pinColor="green"
                />
              )}
              {destination && (
                <mapView.Marker
                  coordinate={{
                    latitude: destination.latitude,
                    longitude: destination.longitude,
                  }}
                  title="Destination"
                  pinColor="red"
                />
              )}
              {pickup && destination && (
                <mapView.Polyline
                  coordinates={[
                    { latitude: pickup.latitude, longitude: pickup.longitude },
                    { latitude: destination.latitude, longitude: destination.longitude }
                  ]}
                  strokeColor="#000"
                  strokeWidth={3}
                />
              )}
            </mapView.MapView>
          ) : (
            <View style={styles.mapPlaceholder}>
              <Text>Map Loading...</Text>
            </View>
          )}
        </View>
        
        <View style={styles.buttonContainer}>
          <SimpleButton 
            title="Search Rides" 
            onPress={handleSearch} 
            disabled={loading}
          />
        </View>
        
        <View style={styles.resultsContainer}>
          {loading ? (
            <Text style={styles.loadingText}>Searching...</Text>
          ) : (
            <FlatList
              data={rides}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <RideCard 
                  ride={item} 
                  onPress={() => handleRidePress(item)} 
                />
              )}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 20,
  },
  mapContainer: {
    height: 300,
    marginBottom: 20,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  buttonContainer: {
    marginVertical: 10,
  },
  currentLocationButton: {
    marginTop: 10,
  },
  loadingText: {
    textAlign: 'center',
    margin: 20,
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
  },
  locationLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  locationLoadingText: {
    marginLeft: 10,
    fontSize: 16,
  },
});