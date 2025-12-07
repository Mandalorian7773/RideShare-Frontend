import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import InputField from '../components/InputField';
import SimpleButton from '../components/SimpleButton';
import { useAuth } from '../utils/AuthContext';
import { sendOtp } from '../src/services/auth/phoneAuth';

export default function PhoneScreen({ navigation }: any) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSendOtp = async () => {
    if (!phone) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }
    
    setLoading(true);
    try {
      const confirmation = await sendOtp(phone);
      navigation.navigate('OTP', { phone, confirmation });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      Alert.alert('Error', 'Failed to send OTP. Please check your phone number and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Phone Number</Text>
      <InputField
        placeholder="Phone Number (e.g., +1234567890)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <SimpleButton 
        title={loading ? "Sending..." : "Send OTP"} 
        onPress={handleSendOtp} 
        disabled={loading}
      />
      <SimpleButton 
        title="Don't have an account? Sign Up" 
        onPress={() => navigation.navigate('Signup')} 
        style={styles.linkButton}
        disabled={loading}
      />
      <SimpleButton 
        title="Or login with email" 
        onPress={() => navigation.navigate('EmailLogin')} 
        style={styles.linkButton}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  linkButton: {
    backgroundColor: 'transparent',
    marginTop: 10,
  },
});