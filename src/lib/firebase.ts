/**
 * Firebase — Directorio Morado
 * Analytics solo se inicializa en el navegador (SSR-safe).
 */
import { initializeApp } from 'firebase/app';
import { getAnalytics, type Analytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCBvOHicAsHWBn2ZjuxgRuANvCH2qM1v6U',
  authDomain: 'directorio-morado.firebaseapp.com',
  projectId: 'directorio-morado',
  storageBucket: 'directorio-morado.firebasestorage.app',
  messagingSenderId: '931376641174',
  appId: '1:931376641174:web:e539d0e6b5d363f4713eb7',
  measurementId: 'G-9Q1DFBNYXE',
};

const app = initializeApp(firebaseConfig);

let analytics: Analytics | null = null;

/** Analytics solo en el cliente (evita error en SSR). */
export function getAnalyticsSafe(): Analytics | null {
  if (typeof window === 'undefined') return null;
  if (!analytics) analytics = getAnalytics(app);
  return analytics;
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export { app };
