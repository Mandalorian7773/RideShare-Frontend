import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type SimpleButtonProps = {
  title: string;
  onPress: () => void;
  style?: object;
  disabled?: boolean;
};

export default function SimpleButton({ title, onPress, style, disabled = false }: SimpleButtonProps) {
  return (
    <TouchableOpacity 
      style={[styles.button, disabled && styles.disabledButton, style]} 
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    margin: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});