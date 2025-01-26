import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Cache configuration
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
export const queryCache = new Map();

// Rate limiting configuration
export const RATE_LIMIT_DURATION = 60 * 1000; // 1 minute in milliseconds
export const RATE_LIMIT_REQUESTS = 50; // Maximum requests per minute
const requestTimestamps: number[] = [];

export function checkRateLimit(): boolean {
  const now = Date.now();
  // Remove timestamps older than the rate limit duration
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - RATE_LIMIT_DURATION) {
    requestTimestamps.shift();
  }
  
  if (requestTimestamps.length >= RATE_LIMIT_REQUESTS) {
    return false;
  }
  
  requestTimestamps.push(now);
  return true;
}

export function getCachedData(key: string) {
  const cached = queryCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

export function setCachedData(key: string, data: any) {
  queryCache.set(key, {
    data,
    timestamp: Date.now()
  });
}