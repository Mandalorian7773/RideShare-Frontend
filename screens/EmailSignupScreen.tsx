import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import InputField from '../components/InputField';
import SimpleButton from '../components/SimpleButton';
import { useAuth } from '../utils/AuthContext';
import { register } from '../api/auth';
import { Picker } from '@react-native-picker/picker';

export default function EmailSignupScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('rider');
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    setLoading(true);
    try {
      const response = await register(email, password, role, firstName, lastName);
      if (response.success) {
        authLogin(response.data.token);
      } else {
        Alert.alert('Error', response.error || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up with Email</Text>
      <InputField
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <InputField
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <InputField
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <InputField
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Role:</Text>
        <Picker
          selectedValue={role}
          style={styles.picker}
          onValueChange={(itemValue) => setRole(itemValue)}
        >
          <Picker.Item label="Rider" value="rider" />
          <Picker.Item label="Driver" value="driver" />
        </Picker>
      </View>
      <SimpleButton 
        title={loading ? "Signing up..." : "Sign Up"} 
        onPress={handleSignup} 
        disabled={loading}
      />
      <SimpleButton 
        title="Already have an account? Login" 
        onPress={() => navigation.navigate('EmailLogin')} 
        style={styles.linkButton}
        disabled={loading}
      />
      <SimpleButton 
        title="Use Phone Signup" 
        onPress={() => navigation.navigate('Signup')} 
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
  pickerContainer: {
    margin: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  picker: {
    height: 50,
  },
  linkButton: {
    backgroundColor: 'transparent',
    marginTop: 10,
  },
});