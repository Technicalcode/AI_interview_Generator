import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // Auth aur Provider import kiya

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-25137.firebaseapp.com",
  projectId: "interviewiq-25137",
  storageBucket: "interviewiq-25137.firebasestorage.app",
  messagingSenderId: "549689637565",
  appId: "1:549689637565:web:3d9ebe590a3a890260d5d4"
};

if (!firebaseConfig.apiKey) {
  console.warn("Firebase API key is missing. Set VITE_FIREBASE_APIKEY in client/.env.");
}


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);


export const provider = new GoogleAuthProvider();

export default app;
