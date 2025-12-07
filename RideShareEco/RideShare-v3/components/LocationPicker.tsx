import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Platform } from 'react-native';

type LocationPickerProps = {
  placeholder: string;
  onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
};

export default function LocationPicker({ placeholder, onLocationSelect }: LocationPickerProps) {
  const [text, setText] = useState('');

  // Handle web platform differently since GooglePlacesAutocomplete is native-only
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={text}
          onChangeText={setText}
          onSubmitEditing={() => {
            // For web, we'll simulate a location selection
            // In a real app, you would integrate with a web-based geocoding service
            onLocationSelect({
              latitude: 37.7749,
              longitude: -122.4194,
              address: text || 'San Francisco, CA'
            });
          }}
        />
      </View>
    );
  }

  // For native platforms, use GooglePlacesAutocomplete
  const GooglePlacesAutocomplete = require('react-native-google-places-autocomplete').GooglePlacesAutocomplete;
  
  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder={placeholder}
        onPress={(data: any, details: any = null) => {
          if (details?.geometry?.location) {
            onLocationSelect({
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
              address: data.description
            });
          }
        }}
        query={{
          key: 'AIzaSyAuQtln4cc-UfpFPch2sVuMr3v2OKzfOk4',
          language: 'en',
        }}
        fetchDetails={true}
        styles={{
          textInput: styles.input,
          listView: styles.listView,
        }}
        enablePoweredByContainer={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
  },
  listView: {
    zIndex: 1000,
  },
});