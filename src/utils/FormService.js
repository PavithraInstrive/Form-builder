import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export const sendNotificationToAllUsers = async (title, body, formId) => {
  try {
    console.log('Starting to send notifications...');
    
   const q = query(
      collection(db, 'userTokens'),
      where('role', '==', 'user')
    );
    
    const tokensSnapshot = await getDocs(q);
    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);
    
    tokens.forEach((token, index) => {
      console.log(`User Token ${index + 1}:`, token.substring(0, 30) + '...');
    });
    
    if (tokens.length === 0) {
      console.log(' No user tokens found (only admins or no tokens)');
      return { sent: 0, failed: 0 };
    }

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
