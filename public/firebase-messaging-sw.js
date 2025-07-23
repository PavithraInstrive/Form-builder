importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBAZs4Jt8u-SyrGV5pqt43fLHWwBNM34Uo",
  authDomain: "form-builder-a6dce.firebaseapp.com",
  projectId: "form-builder-a6dce",
  appId: "1:187204651496:web:a534c6811ce6a10e6d7c5d",
  storageBucket: "form-builder-a6dce.firebasestorage.app",
  messagingSenderId: "187204651496"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});