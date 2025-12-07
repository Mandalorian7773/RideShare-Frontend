import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import RideCard from '../components/RideCard';
import { getCurrentRides } from '../api/rides';

export default function CurrentRidesScreen({ navigation }: any) {
  const [rides, setRides] = useState<any[]>([]);

  useEffect(() => {
    loadCurrentRides();
  }, []);

  const loadCurrentRides = async () => {
    try {
      const response = await getCurrentRides();
      if (response.success) {
        setRides(response.data);
      }
    } catch (error) {
      console.error('Error loading current rides:', error);
    }
  };

  const handleRidePress = (ride: any) => {
    navigation.navigate('RideDetails', { rideId: ride.id });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current Rides</Text>
      <FlatList
        data={rides}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RideCard 
            ride={item} 
            onPress={() => handleRidePress(item)} 
          />
        )}
      />
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
});