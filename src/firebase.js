import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";


const firebaseConfig = {
  apiKey: "AIzaSyBAZs4Jt8u-SyrGV5pqt43fLHWwBNM34Uo",
  authDomain: "form-builder-a6dce.firebaseapp.com",
  projectId: "form-builder-a6dce",
  appId: "1:187204651496:web:a534c6811ce6a10e6d7c5d",
  storageBucket: "form-builder-a6dce.firebasestorage.app",
  messagingSenderId: "187204651496"
};

export const FIREBASE_VAPID_KEY ="BFhmvTbHe5DjOd2W6nQ_o41PdvMhmBEdwVxaMSy16P7E76yZn_sfCZDFNxng48IOtmnCXqAgHWtQKMiZs7wpDuM"
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Simple function to get notification permission and token
export const enableNotifications = async (userId) => {
  try {
    // Ask for permission
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      alert('Please allow notifications to receive updates about new forms!');
      return null;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("Got notification token:", token);
      
      // Save token to Firestore
      const db = getFirestore(app);
      await setDoc(doc(db, 'userTokens', userId), {
        token: token,
        userId: userId,
        createdAt: new Date()
      });
      
      return token;
    }
  } catch (error) {
    console.error("Error getting notification token:", error);
    return null;
  }
};

// Listen for foreground messages
export const listenForMessages = () => {
  onMessage(messaging, (payload) => {
    console.log('Message received:', payload);
    
    // Show notification
    new Notification(payload.notification.title, {
      body: payload.notification.body,
      icon: '/icons/icon-192x192.png'
    });
  });
};

export const auth = getAuth(app);
export const db = getFirestore(app);