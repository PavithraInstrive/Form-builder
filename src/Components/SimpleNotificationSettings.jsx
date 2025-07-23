// components/SimpleNotificationSettings.jsx
import React, { useState, useEffect } from 'react';
import { Button, Card, Typography, Box, Alert } from '@mui/material';
import { enableNotifications } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const SimpleNotificationSettings = () => {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if notifications were previously enabled
    const notificationStatus = localStorage.getItem(`notifications_${user?.uid}`);
    if (notificationStatus === 'enabled') {
      setIsEnabled(true);
    }
  }, [user]);

  const handleEnableNotifications = async () => {
    if (!user) {
      alert('Please log in first');
      return;
    }

    setLoading(true);
    
    try {
      const token = await enableNotifications(user.uid);
      
      if (token) {
        setIsEnabled(true);
        localStorage.setItem(`notifications_${user.uid}`, 'enabled');
        alert('Notifications enabled! You will now receive updates about new forms.');
      } else {
        alert('Failed to enable notifications. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    }
    
    setLoading(false);
  };

  const handleDisableNotifications = () => {
    setIsEnabled(false);
    localStorage.removeItem(`notifications_${user?.uid}`);
    alert('Notifications disabled. You can re-enable them anytime.');
  };

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        📱 Push Notifications
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Get notified when new forms are available for you to fill out.
      </Typography>

      {isEnabled ? (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            ✅ Notifications are enabled! You'll receive updates about new forms.
          </Alert>
          <Button 
            variant="outlined" 
            color="error"
            onClick={handleDisableNotifications}
          >
            Disable Notifications
          </Button>
        </Box>
      ) : (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            Enable notifications to get instant updates when new forms are published.
          </Alert>
          <Button 
            variant="contained" 
            onClick={handleEnableNotifications}
            disabled={loading}
          >
            {loading ? 'Enabling...' : 'Enable Notifications'}
          </Button>
        </Box>
      )}
    </Card>
  );
};

export default SimpleNotificationSettings;