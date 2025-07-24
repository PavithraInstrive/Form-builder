import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBAZs4Jt8u-SyrGV5pqt43fLHWwBNM34Uo",
  authDomain: "form-builder-a6dce.firebaseapp.com",
  projectId: "form-builder-a6dce",
  appId: "1:187204651496:web:a534c6811ce6a10e6d7c5d",
  storageBucket: "form-builder-a6dce.firebasestorage.app",
  messagingSenderId: "187204651496",
};

export const FIREBASE_VAPID_KEY =
  "BFhmvTbHe5DjOd2W6nQ_o41PdvMhmBEdwVxaMSy16P7E76yZn_sfCZDFNxng48IOtmnCXqAgHWtQKMiZs7wpDuM";
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const getAndSaveFCMToken = async (userId) => {
  try {
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    const token = await getToken(messaging, {
      vapidKey: FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("Got FCM token:", token.substring(0, 20) + "...");

      const userRole = localStorage.getItem("userRole") || "user";

      // Save tokens for both users and admins now
      const db = getFirestore(app);
      await setDoc(doc(db, "userTokens", userId), {
        token: token,
        userId: userId,
        role: userRole,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      });

      console.log("Token saved for role:", userRole);
      return token;
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
};

export const initializeNotifications = async (userId) => {
  try {
    // Initialize notifications for both users and admins
    if (Notification.permission === "granted") {
      return await getAndSaveFCMToken(userId);
    }

    localStorage.setItem("pendingNotificationUserId", userId);
    return null;
  } catch (error) {
    console.error("Error initializing notifications:", error);
    return null;
  }
};

export const requestNotificationPermission = async (userId) => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      return await getAndSaveFCMToken(userId);
    } else {
      console.log("Notification permission denied");
      return null;
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return null;
  }
};

export const listenForMessages = () => {
  onMessage(messaging, (payload) => {
    console.log("Message received:", payload);

    if (document.visibilityState === "visible") {
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: "/icons/icon-192x192.png",
        tag: payload.data?.formId || "general",
      });
    }
  });
};

export const auth = getAuth(app);
export const db = getFirestore(app);