// utils/simpleFormService.js
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

// Simple function to send notifications to all users
export const sendNotificationToAllUsers = async (title, body, formId) => {
  try {
    console.log('Starting to send notifications...');
    
    // Get all user tokens from Firestore
   const q = query(
      collection(db, 'userTokens'),
      where('role', '==', 'user') // Only get tokens for 'user' role
    );
    
    const tokensSnapshot = await getDocs(q);
    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);
    
    console.log(`📱 Found ${tokens.length} user tokens (admins excluded)`);
    tokens.forEach((token, index) => {
      console.log(`User Token ${index + 1}:`, token.substring(0, 30) + '...');
    });
    
    if (tokens.length === 0) {
      console.log('❌ No user tokens found (only admins or no tokens)');
      return { sent: 0, failed: 0 };
    }

    // Send to your backend API
    const response = await fetch('http://localhost:3000/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokens: tokens,
        title: title,
        body: body,
        formId: formId
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Notification result:', result);
    
    return result;

  } catch (error) {
    console.error('Error sending notifications:', error);
    throw new Error('Failed to send notifications: ' + error.message);
  }
};

// Function to create form and send notifications (if you need it elsewhere)
export const createFormAndNotify = async (formData, userId, sendNotifications = true) => {
  try {
    // This would be used if creating forms from FormBuilder
    // For now, we're just handling publishing existing forms
    console.log('createFormAndNotify called', { formData, userId, sendNotifications });
    
    // You can implement this if needed for FormBuilder
    return {
      success: true,
      message: 'Form created successfully'
    };

  } catch (error) {
    console.error('Error creating form:', error);
    throw new Error('Failed to create form');
  }
};