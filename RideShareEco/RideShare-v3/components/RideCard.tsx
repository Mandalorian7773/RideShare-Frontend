import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type Ride = {
  id: number;
  pickupAddress: string;
  destinationAddress: string;
  departureTime: string;
  availableSeats: number;
  totalSeats: number;
  pricePerSeat: number;
  status: string;
};

type RideCardProps = {
  ride: Ride;
  onPress: () => void;
};

export default function RideCard({ ride, onPress }: RideCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.address}>{ride.pickupAddress}</Text>
        <Text style={styles.arrow}>→</Text>
        <Text style={styles.address}>{ride.destinationAddress}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.detailText}>Departure: {new Date(ride.departureTime).toLocaleString()}</Text>
        <Text style={styles.detailText}>Seats: {ride.availableSeats}/{ride.totalSeats}</Text>
        <Text style={styles.detailText}>Price: ${ride.pricePerSeat}</Text>
        <Text style={styles.status}>Status: {ride.status}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  address: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  arrow: {
    fontSize: 20,
  },
  details: {
    flexDirection: 'column',
  },
  detailText: {
    fontSize: 14,
    marginBottom: 5,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
});