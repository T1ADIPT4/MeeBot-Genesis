
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

// Default configuration is explicitly null.
// This ensures that the app defaults to "Simulation Mode" (offline) unless the user
// explicitly provides valid credentials in the Settings page. This prevents connection
// timeout errors (e.g., "Could not reach Cloud Firestore backend") caused by auto-connecting
// to a non-existent or restricted project.
const DEFAULT_CONFIG: FirebaseConfig | null = null;

let app: FirebaseApp | undefined;
let db: Firestore | null = null;

export const getStoredConfig = (): FirebaseConfig | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Return stored config if available
    if (stored) return JSON.parse(stored);
    // Otherwise return default (null)
    return DEFAULT_CONFIG;
  } catch (e) {
    console.error("Error parsing firebase config", e);
    return null;
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

// Check if config exists and has at least an API key and Project ID
if (config && config.apiKey && config.projectId) {
  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    db = getFirestore(app);
    console.log(`Firebase initialized successfully for project: ${config.projectId}`);
  } catch (e) {
    console.error("Failed to initialize Firebase:", e);
    // Fallback logic could be added here, but leaving db as null ensures strict "Simulation Mode"
  }
} else {
    console.log("No valid Firebase configuration found. Running in Simulation Mode.");
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