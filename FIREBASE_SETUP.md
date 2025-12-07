# Firebase Setup Instructions

## Prerequisites

1. Create a Firebase project at https://console.firebase.google.com/
2. Register your iOS and Android apps in the Firebase console

## Setup Steps

### 1. Download Configuration Files

#### For Android:
1. Download `google-services.json` from your Firebase project settings
2. Place it in: `android/app/google-services.json`

#### For iOS:
1. Download `GoogleService-Info.plist` from your Firebase project settings
2. Place it in: `ios/GoogleService-Info.plist`

### 2. Configure Firebase in Your App

The Firebase configuration has already been added to:
- `app.json` (Expo plugins)
- `package.json` (dependencies)

### 3. Add Firebase Config (Optional)

If you need to add custom Firebase configuration, edit `src/firebase/config.ts`:

```typescript
// TODO: Add your Firebase config object here if needed
// Usually not required when using automatic initialization
```

### 4. Install Dependencies

Run:
```bash
npm install
```

### 5. Build for Development

For custom development client:
```bash
npx expo run:android
# or
npx expo run:ios
```

## Verification

After setting up the configuration files, you can verify the setup by:

1. Running the app in development mode
2. Navigating to the phone authentication screen
3. Entering a phone number and attempting to send an OTP
4. Checking the console logs for any Firebase-related errors

## Troubleshooting

1. If you get build errors, make sure the configuration files are in the correct locations
2. Ensure you've registered your app bundle IDs correctly in Firebase
3. For iOS, you may need to run `pod install` in the `ios` directory
4. If you get "unavailable" errors, make sure you've enabled Phone Authentication in Firebase Console

## Firebase Features Implemented

- Phone Authentication with OTP
- Firestore user data storage
- Automatic user document creation/update
- Auth state persistence