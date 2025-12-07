import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import SimpleButton from '../components/SimpleButton';
import { requestRide } from '../api/rides';

export default function RideDetailsScreen({ route, navigation }: any) {
  const { rideId } = route.params;
  const [ride, setRide] = useState<any>(null);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, you would fetch ride details from the API
    // For now, we'll use mock data
    setRide({
      id: rideId,
      pickupAddress: '123 Main St',
      destinationAddress: '456 Oak Ave',
      departureTime: '2023-12-01T10:00:00Z',
      availableSeats: 3,
      totalSeats: 4,
      pricePerSeat: 15.50,
      status: 'open',
      driver: {
        firstName: 'John',
        lastName: 'Doe',
        rating: 4.5,
      },
    });
  }, [rideId]);

  const handleRequestSeat = async () => {
    try {
      const response = await requestRide(rideId);
      
      if (response.success) {
        setRequestStatus('pending');
        Alert.alert('Success', 'Seat request sent!');
      } else {
        Alert.alert('Error', 'Failed to request seat');
      }
    } catch (error) {
      console.error('Error requesting seat:', error);
      Alert.alert('Error', 'Failed to request seat');
    }
  };

  const handleChat = () => {
    navigation.navigate('Chat', { rideId });
  };

  if (!ride) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ride Details</Text>
      
      <View style={styles.rideInfo}>
        <Text style={styles.infoLabel}>Pickup:</Text>
        <Text style={styles.infoValue}>{ride.pickupAddress}</Text>
        
        <Text style={styles.infoLabel}>Destination:</Text>
        <Text style={styles.infoValue}>{ride.destinationAddress}</Text>
        
        <Text style={styles.infoLabel}>Departure:</Text>
        <Text style={styles.infoValue}>{new Date(ride.departureTime).toLocaleString()}</Text>
        
        <Text style={styles.infoLabel}>Seats Available:</Text>
        <Text style={styles.infoValue}>{ride.availableSeats}/{ride.totalSeats}</Text>
        
        <Text style={styles.infoLabel}>Price Per Seat:</Text>
        <Text style={styles.infoValue}>${ride.pricePerSeat}</Text>
        
        <Text style={styles.infoLabel}>Status:</Text>
        <Text style={styles.infoValue}>{ride.status}</Text>
        
        <Text style={styles.infoLabel}>Driver:</Text>
        <Text style={styles.infoValue}>{ride.driver.firstName} {ride.driver.lastName} (Rating: {ride.driver.rating})</Text>
      </View>
      
      {requestStatus ? (
        <Text style={styles.requestStatus}>Request Status: {requestStatus}</Text>
      ) : (
        <SimpleButton title="Request Seat" onPress={handleRequestSeat} />
      )}
      
      <SimpleButton title="Chat with Driver" onPress={handleChat} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  rideInfo: {
    marginBottom: 20,
  },
  infoLabel: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  infoValue: {
    fontSize: 16,
    marginBottom: 5,
  },
  requestStatus: {
    textAlign: 'center',
    margin: 20,
    fontSize: 16,
    fontWeight: 'bold',
  },
});