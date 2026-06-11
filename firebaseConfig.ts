import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD3LDalp2rnWQjCoRyNKgXJWyAUiomBdKM",
  authDomain: "pawfriends-mobile.firebaseapp.com",
  projectId: "pawfriends-mobile",
  storageBucket: "pawfriends-mobile.firebasestorage.app",
  messagingSenderId: "733132168085",
  appId: "1:733132168085:web:7543a24c5cff786567749c",
  measurementId: "G-5TTYKZSQ0S"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);