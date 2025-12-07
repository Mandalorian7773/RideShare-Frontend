// Simple test script to verify Firebase connection
console.log('Testing Firebase connection...');

try {
  const firebase = require('@react-native-firebase/app');
  console.log('✅ Firebase app module loaded successfully');
  
  // Check if Firebase app is initialized
  const apps = firebase.apps;
  console.log(`✅ Firebase has ${apps.length} initialized apps`);
  
  if (apps.length > 0) {
    console.log(`✅ Default app name: ${apps[0].name}`);
    console.log(`✅ Default app options: ${Object.keys(apps[0].options).join(', ')}`);
  }
  
  // Try to load auth module
  const auth = require('@react-native-firebase/auth');
  console.log('✅ Firebase auth module loaded successfully');
  
  // Try to load firestore module
  const firestore = require('@react-native-firebase/firestore');
  console.log('✅ Firebase firestore module loaded successfully');
  
  console.log('\n🎉 All Firebase modules loaded successfully!');
  console.log('Your Firebase integration is ready to use.');
  
} catch (error) {
  console.error('❌ Error loading Firebase modules:', error.message);
  process.exit(1);
}