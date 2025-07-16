import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBAZs4Jt8u-SyrGV5pqt43fLHWwBNM34Uo",
  authDomain: "form-builder-a6dce.firebaseapp.com",
  projectId: "form-builder-a6dce",
  appId: "1:187204651496:web:a534c6811ce6a10e6d7c5d",
  storageBucket: "form-builder-a6dce.firebasestorage.app",
  messagingSenderId: "187204651496"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
