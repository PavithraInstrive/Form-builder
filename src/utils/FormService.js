import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

// Existing function for notifying users when forms are published
export const sendNotificationToAllUsers = async (title, body, formId) => {
  try {
    console.log("Starting to send notifications to users...");

    const q = query(collection(db, "userTokens"), where("role", "==", "user"));

    const tokensSnapshot = await getDocs(q);
    const tokens = tokensSnapshot.docs.map((doc) => doc.data().token);

    tokens.forEach((token, index) => {
      console.log(`User Token ${index + 1}:`, token.substring(0, 30) + "...");
    });

    if (tokens.length === 0) {
      console.log("No user tokens found (only admins or no tokens)");
      return { sent: 0, failed: 0 };
    }

    const response = await fetch(
      "https://form-builder-bacnend-production.up.railway.app/api/notify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tokens: tokens,
          title: title,
          body: body,
          formId: formId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Notification result:", result);

    return result;
  } catch (error) {
    console.error("Error sending notifications:", error);
    throw new Error("Failed to send notifications: " + error.message);
  }
};

// NEW: Function for notifying admins when forms are submitted
export const sendNotificationToAllAdmins = async (title, body, formId, userData = {}) => {
  try {
    console.log("Starting to send notifications to admins...");

    const q = query(collection(db, "userTokens"), where("role", "==", "admin"));

    const tokensSnapshot = await getDocs(q);
    const tokens = tokensSnapshot.docs.map((doc) => doc.data().token);

    tokens.forEach((token, index) => {
      console.log(`Admin Token ${index + 1}:`, token.substring(0, 30) + "...");
    });

    if (tokens.length === 0) {
      console.log("No admin tokens found");
      return { sent: 0, failed: 0 };
    }

    const response = await fetch(
      "https://form-builder-bacnend-production.up.railway.app/api/notify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tokens: tokens,
          title: title,
          body: body,
          formId: formId,
          userData: userData,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Admin notification result:", result);

    return result;
  } catch (error) {
    console.error("Error sending admin notifications:", error);
    throw new Error("Failed to send admin notifications: " + error.message);
  }
};