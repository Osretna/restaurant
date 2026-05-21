// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAzbuMVzDNcFFDZzUYqUVB9x7wAKitOI3Q",
  authDomain: "food-9cb69.firebaseapp.com",
  databaseURL: "https://food-9cb69-default-rtdb.firebaseio.com",
  projectId: "food-9cb69",
  storageBucket: "food-9cb69.firebasestorage.app",
  messagingSenderId: "191499198052",
  appId: "1:191499198052:web:86f0a16b9e263bec2d0971",
  measurementId: "G-V8ZQXL89PW"
};

// منع إعادة تشغيل Firebase في كل مرة (مهم لـ Next.js)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };