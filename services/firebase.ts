
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  Timestamp
} from 'firebase/firestore';

const STORAGE_KEY = 'meechain-firebase-config';

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  databaseURL?: string;
};

// Default configuration provided for the MeeChain demo
const DEFAULT_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyBhprcnCRZVHE3df9wvK9VkQdSUwiGw11E",
  authDomain: "meechainmeebot-v1-218162-261fc.firebaseapp.com",
  databaseURL: "https://meechainmeebot-v1-218162-261fc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "meechainmeebot-v1-218162-261fc",
  storageBucket: "meechainmeebot-v1-218162-261fc.firebasestorage.app",
  messagingSenderId: "412472571465",
  appId: "1:412472571465:web:bbdc5c179e131b111ff198",
  measurementId: "G-CZEY486FED"
};

let app: FirebaseApp | undefined;
let db: Firestore | null = null;

export const getStoredConfig = (): FirebaseConfig | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Return stored config if available, otherwise use default
    if (stored) return JSON.parse(stored);
    return DEFAULT_CONFIG;
  } catch (e) {
    console.error("Error parsing firebase config", e);
    return DEFAULT_CONFIG;
  }
};

export const saveConfig = (config: FirebaseConfig) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export const clearConfig = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
};

// Initialize Firebase using the stored or default config
const config = getStoredConfig();

if (config && config.apiKey) {
  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    db = getFirestore(app);
    console.log("Firebase initialized successfully.");
  } catch (e) {
    console.error("Failed to initialize Firebase:", e);
  }
}

export { db, app };

export const isFirebaseInitialized = (): boolean => {
  return !!db;
};

// Re-export Firestore functions for easier import in other files
export { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  Timestamp
};
