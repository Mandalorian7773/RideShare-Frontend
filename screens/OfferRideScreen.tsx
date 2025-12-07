import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Dimensions, Platform, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import LocationPicker from '../components/LocationPicker';
import InputField from '../components/InputField';
import SimpleButton from '../components/SimpleButton';
import { createRide } from '../api/rides';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function OfferRideScreen({ navigation }: any) {
  const [pickup, setPickup] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);
  const [departureDate, setDepartureDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [totalSeats, setTotalSeats] = useState('4');
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
          Marker: maps.Marker
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
          'Location permission is required to set pickup/destination points. You can still manually enter locations.',
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

  const handleMapPress = (e: any) => {
    // In a real app, you would show a marker and allow user to select pickup/destination
    console.log('Map pressed:', e.nativeEvent.coordinate);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  const calculatePrice = () => {
    if (!pickup || !destination) return 0;
    const distance = calculateDistance(
      pickup.latitude,
      pickup.longitude,
      destination.latitude,
      destination.longitude
    );
    return Math.round(distance * 10); // 10 Rs per km
  };

  const handleOfferRide = async () => {
    if (!pickup || !destination) {
      Alert.alert('Error', 'Please select both pickup and destination locations');
      return;
    }

    try {
      // Combine date and time
      const departureDateTime = new Date(departureDate);
      
      const rideData = {
        pickupLatitude: pickup.latitude,
        pickupLongitude: pickup.longitude,
        pickupAddress: pickup.address,
        destinationLatitude: destination.latitude,
        destinationLongitude: destination.longitude,
        destinationAddress: destination.address,
        departureTime: departureDateTime.toISOString(),
        totalSeats: parseInt(totalSeats)
        // pricePerSeat is calculated automatically by the backend
      };

      const response = await createRide(rideData);
      
      if (response.success) {
        Alert.alert('Success', 'Ride offered successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', response.error || 'Failed to offer ride');
      }
    } catch (error: any) {
      console.error('Error offering ride:', error);
      Alert.alert('Error', error.message || 'Failed to offer ride');
    }
  };

  const onChangeDate = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || departureDate;
    setShowDatePicker(false);
    setDepartureDate(currentDate);
  };

  const onChangeTime = (event: any, selectedTime: any) => {
    const currentTime = selectedTime || departureDate;
    setShowTimePicker(false);
    
    // Combine current date with selected time
    const newDateTime = new Date(departureDate);
    newDateTime.setHours(currentTime.getHours());
    newDateTime.setMinutes(currentTime.getMinutes());
    setDepartureDate(newDateTime);
  };

  // Update map region when pickup location is selected
  const handlePickupSelect = (location: any) => {
    setPickup(location);
    updateMapRegion(location, destination);
  };

  // Update map region when destination location is selected
  const handleDestinationSelect = (location: any) => {
    setDestination(location);
    updateMapRegion(pickup, location);
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

  // Set destination to current location
  const setDestinationToCurrentLocation = async () => {
    if (currentLocation) {
      const locationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        address: 'Current Location'
      };
      handleDestinationSelect(locationData);
    } else {
      // Try to get location again
      await getCurrentLocation();
      if (currentLocation) {
        const locationData = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          address: 'Current Location'
        };
        handleDestinationSelect(locationData);
      } else {
        Alert.alert('Location Not Available', 'Please enable location services and try again.');
      }
    }
  };

  // Update map region to fit both pickup and destination markers
  const updateMapRegion = (pickupLoc: any, destinationLoc: any) => {
    if (pickupLoc && destinationLoc) {
      // Fit both markers on the map
      const minLat = Math.min(pickupLoc.latitude, destinationLoc.latitude);
      const maxLat = Math.max(pickupLoc.latitude, destinationLoc.latitude);
      const minLng = Math.min(pickupLoc.longitude, destinationLoc.longitude);
      const maxLng = Math.max(pickupLoc.longitude, destinationLoc.longitude);
      
      const latitudeDelta = (maxLat - minLat) * 1.5;
      const longitudeDelta = (maxLng - minLng) * 1.5;
      
      setMapRegion({
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: latitudeDelta || LATITUDE_DELTA,
        longitudeDelta: longitudeDelta || LONGITUDE_DELTA,
      });
    } else if (pickupLoc) {
      setMapRegion({
        latitude: pickupLoc.latitude,
        longitude: pickupLoc.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
    } else if (destinationLoc) {
      setMapRegion({
        latitude: destinationLoc.latitude,
        longitude: destinationLoc.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
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
      <Text style={styles.title}>Offer Ride</Text>
      
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
          {locationLoading ? null : (
            <SimpleButton 
              title="Use Current Location" 
              onPress={setDestinationToCurrentLocation} 
              style={styles.currentLocationButton}
              disabled={!locationServicesEnabled}
            />
          )}
        </View>
        
        <View style={styles.mapContainer}>
          {Platform.OS === 'web' ? (
            <WebMap />
          ) : mapView ? (
            <mapView.MapView
              style={styles.map}
              region={mapRegion}
              onPress={handleMapPress}
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
            </mapView.MapView>
          ) : (
            <View style={styles.mapPlaceholder}>
              <Text>Map Loading...</Text>
            </View>
          )}
        </View>
        
        <View style={styles.form}>
          {/* Conditional rendering for date/time pickers on web */}
          {Platform.OS !== 'web' && (
            <>
              <TouchableOpacity 
                style={styles.dateButton} 
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  Date: {departureDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={departureDate}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                />
              )}
              
              <TouchableOpacity 
                style={styles.dateButton} 
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  Time: {departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
              
              {showTimePicker && (
                <DateTimePicker
                  value={departureDate}
                  mode="time"
                  display="default"
                  onChange={onChangeTime}
                />
              )}
            </>
          )}
          
          <InputField
            placeholder="Total Seats (Default: 4)"
            value={totalSeats}
            onChangeText={setTotalSeats}
            keyboardType="numeric"
          />
          
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>
              Estimated Distance: {pickup && destination ? calculateDistance(pickup.latitude, pickup.longitude, destination.latitude, destination.longitude).toFixed(2) : '0'} km
            </Text>
            <Text style={styles.priceText}>
              Calculated Price: ₹{calculatePrice()} per seat
            </Text>
          </View>
          
          <SimpleButton title="Offer Ride" onPress={handleOfferRide} />
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
  form: {
    padding: 20,
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 5,
    marginVertical: 5,
  },
  dateButtonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  priceContainer: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2e7d32',
    marginVertical: 2,
  },
  currentLocationButton: {
    marginTop: 10,
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