#!/usr/bin/env node

// Script to verify Firebase setup
console.log('Verifying Firebase setup...');

// Check if Firebase packages are installed
try {
  const firebaseApp = require('@react-native-firebase/app');
  console.log('✅ @react-native-firebase/app is installed');
} catch (error) {
  console.log('❌ @react-native-firebase/app is not installed');
}

try {
  const firebaseAuth = require('@react-native-firebase/auth');
  console.log('✅ @react-native-firebase/auth is installed');
} catch (error) {
  console.log('❌ @react-native-firebase/auth is not installed');
}

try {
  const firebaseFirestore = require('@react-native-firebase/firestore');
  console.log('✅ @react-native-firebase/firestore is installed');
} catch (error) {
  console.log('❌ @react-native-firebase/firestore is not installed');
}

// Check app.json for Firebase plugins
const fs = require('fs');
const path = require('path');

try {
  const appJsonPath = path.join(__dirname, '..', 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  if (appJson.expo && appJson.expo.plugins) {
    const hasAppPlugin = appJson.expo.plugins.includes('@react-native-firebase/app');
    const hasAuthPlugin = appJson.expo.plugins.includes('@react-native-firebase/auth');
    
    console.log(hasAppPlugin ? '✅ @react-native-firebase/app plugin is configured' : '❌ @react-native-firebase/app plugin is not configured');
    console.log(hasAuthPlugin ? '✅ @react-native-firebase/auth plugin is configured' : '❌ @react-native-firebase/auth plugin is not configured');
  } else {
    console.log('❌ Firebase plugins are not configured in app.json');
  }
} catch (error) {
  console.log('❌ Could not read app.json:', error.message);
}

console.log('\nSetup verification complete!');
console.log('Refer to FIREBASE_SETUP.md for detailed instructions on configuring Firebase.');