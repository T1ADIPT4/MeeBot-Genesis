import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// IMPORTANT: Replace with your web app's Firebase configuration.
// You can find this in your project's settings on the Firebase console.
const firebaseConfig = {
  apiKey: "AIzaSy...YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "1:your-sender-id:web:your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the Firestore database instance
export const db = getFirestore(app);
