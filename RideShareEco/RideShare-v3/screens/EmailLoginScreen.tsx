import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import InputField from '../components/InputField';
import SimpleButton from '../components/SimpleButton';
import { useAuth } from '../utils/AuthContext';
import { login } from '../api/auth';

export default function EmailLoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    setLoading(true);
    try {
      const response = await login(email, password);
      if (response.success) {
        authLogin(response.data.token);
      } else {
        Alert.alert('Error', response.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to login. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login with Email</Text>
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
      <SimpleButton 
        title={loading ? "Logging in..." : "Login"} 
        onPress={handleLogin} 
        disabled={loading}
      />
      <SimpleButton 
        title="Don't have an account? Sign Up" 
        onPress={() => navigation.navigate('EmailSignup')} 
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