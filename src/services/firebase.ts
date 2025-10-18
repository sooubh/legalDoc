// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQb6htbUHR-47xK6VE-hGpbe3_0sa2gWo",
  authDomain: "gen-ai-77.firebaseapp.com",
  projectId: "gen-ai-77",
  storageBucket: "gen-ai-77.firebasestorage.app",
  messagingSenderId: "42593977465",
  appId: "1:42593977465:web:253083dcd6e835df9c40a8",
  measurementId: "G-FGBBS16113"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
