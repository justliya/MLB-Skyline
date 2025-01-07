import { initializeApp } from '@react-native-firebase/app';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'your-app.firebaseapp.com',
  projectId: 'your-app',
  storageBucket: 'your-app.appspot.com',
  messagingSenderId: 'YOUR_ID',
  appId: 'YOUR_APP_ID',
};

const app = initializeApp(firebaseConfig);
export default app;