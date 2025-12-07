const fs = require('fs');
const path = require('path');

console.log('Verifying Firebase setup...\n');

// Check if google-services.json exists
const googleServicesPath = path.join(__dirname, '..', 'google-services.json');
if (fs.existsSync(googleServicesPath)) {
  console.log('✅ google-services.json found');
} else {
  console.log('❌ google-services.json not found in project root');
}

// Check if Firebase packages are in package.json
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  
  const hasApp = packageJson.dependencies && packageJson.dependencies['@react-native-firebase/app'];
  const hasAuth = packageJson.dependencies && packageJson.dependencies['@react-native-firebase/auth'];
  const hasFirestore = packageJson.dependencies && packageJson.dependencies['@react-native-firebase/firestore'];
  
  console.log(hasApp ? '✅ @react-native-firebase/app installed' : '❌ @react-native-firebase/app not installed');
  console.log(hasAuth ? '✅ @react-native-firebase/auth installed' : '❌ @react-native-firebase/auth not installed');
  console.log(hasFirestore ? '✅ @react-native-firebase/firestore installed' : '❌ @react-native-firebase/firestore not installed');
} catch (error) {
  console.log('❌ Could not read package.json');
}

// Check app.json for Firebase plugins
try {
  const appJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'app.json'), 'utf8'));
  
  if (appJson.expo && appJson.expo.plugins) {
    const hasAppPlugin = appJson.expo.plugins.includes('@react-native-firebase/app');
    const hasAuthPlugin = appJson.expo.plugins.includes('@react-native-firebase/auth');
    
    console.log(hasAppPlugin ? '✅ @react-native-firebase/app plugin configured' : '❌ @react-native-firebase/app plugin not configured');
    console.log(hasAuthPlugin ? '✅ @react-native-firebase/auth plugin configured' : '❌ @react-native-firebase/auth plugin not configured');
  }
  
  // Check if googleServicesFile is configured
  if (appJson.expo && appJson.expo.android && appJson.expo.android.googleServicesFile) {
    console.log('✅ google-services.json configured in app.json');
  } else {
    console.log('ℹ️  Note: google-services.json path not configured in app.json (may be OK for Expo)');
  }
} catch (error) {
  console.log('❌ Could not read app.json');
}

console.log('\nVerification complete!');