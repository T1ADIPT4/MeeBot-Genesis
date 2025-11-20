import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- Firebase Configuration ---
// IMPORTANT: The credentials you provided are for a service account, which is meant for backend servers and MUST NOT be used in a frontend application for security reasons.
//
// To connect your web app to Firebase, you need to use the "Web app" configuration.
//
// Please follow these steps:
// 1. Go to your Firebase project console: https://console.firebase.google.com/project/meechainmeebot-v1-218162-261fc/overview
// 2. Go to Project Settings (click the ⚙️ gear icon).
// 3. Under the "General" tab, scroll down to "Your apps".
// 4. If you don't have a web app, create one.
// 5. Find your web app and click on "Config" (or the </> icon) to see your web app's Firebase configuration.
// 6. Copy the values from that configuration object and paste them here.
//
// I have pre-filled the values that can be safely derived from your project ID.
const firebaseConfig = {
  // TODO: PASTE YOUR WEB API KEY HERE
  apiKey: "AIzaSy...YOUR_API_KEY_FROM_FIREBASE_CONSOLE",
  
  // These values are derived from your project ID
  authDomain: "meechainmeebot-v1-218162-261fc.firebaseapp.com",
  projectId: "meechainmeebot-v1-218162-261fc",
  storageBucket: "meechainmeebot-v1-218162-261fc.appspot.com",
  
  // TODO: PASTE YOUR MESSAGING SENDER ID HERE
  messagingSenderId: "YOUR_SENDER_ID_FROM_FIREBASE_CONSOLE",
  
  // TODO: PASTE YOUR APP ID HERE
  appId: "YOUR_APP_ID_FROM_FIREBASE_CONSOLE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the Firestore database instance
export const db = getFirestore(app);
