// FIXED Dashboard component - Replace your existing Dashboard

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Alert,
  Switch,
  FormControlLabel,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  ListAlt as FormsIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { enableNotifications, listenForMessages } from '../firebase';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // FIX: Use currentUser (not user) from your AuthContext
  const { currentUser } = useAuth(); // Changed from { user } to { currentUser }
  
  const role = localStorage.getItem('userRole');
  const isAdmin = role === 'admin';
  
  // Notification states
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  useEffect(() => {
    // Check if notifications were previously enabled
    if (currentUser) { // Changed from user to currentUser
      const notificationStatus = localStorage.getItem(`notifications_${currentUser.uid}`);
      if (notificationStatus === 'enabled') {
        setNotificationsEnabled(true);
      }
    }

    // Set up message listener
    listenForMessages();
  }, [currentUser]); // Changed from [user] to [currentUser]

  // Debug function to check user state
  const debugUser = () => {
    console.log('=== DEBUG USER INFO ===');
    console.log('currentUser from context:', currentUser);
    console.log('currentUser.uid:', currentUser?.uid);
    console.log('localStorage userRole:', localStorage.getItem('userRole'));
    console.log('=====================');
  };

  const handleEnableNotifications = async () => {
    // Debug first
    debugUser();
    
    if (!currentUser || !currentUser.uid) { // Changed from user to currentUser
      alert('Please log in first - no user found');
      console.error('No currentUser found:', currentUser);
      return;
    }

    console.log('Enabling notifications for user:', currentUser.uid);
    setNotificationLoading(true);
    
    try {
      const token = await enableNotifications(currentUser.uid); // Changed from user.uid to currentUser.uid
      
      if (token) {
        setNotificationsEnabled(true);
        localStorage.setItem(`notifications_${currentUser.uid}`, 'enabled'); // Changed from user.uid to currentUser.uid
        alert('🎉 Notifications enabled! You will now receive updates about new forms.');
      } else {
        alert('❌ Failed to enable notifications. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Something went wrong. Please try again.');
    }
    
    setNotificationLoading(false);
  };

  const handleDisableNotifications = () => {
    setNotificationsEnabled(false);
    localStorage.removeItem(`notifications_${currentUser?.uid}`); // Changed from user?.uid to currentUser?.uid
    alert('🔕 Notifications disabled. You can re-enable them anytime.');
  };

  const handleToggleNotifications = () => {
    if (notificationsEnabled) {
      handleDisableNotifications();
    } else {
      handleEnableNotifications();
    }
  };

  // Show loading if no user yet
  if (!currentUser) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading user data...
        </Typography>
      </Container>
    );
  }

  const quickActions = [
    ...(isAdmin ? [{
      title: 'Create New Form',
      description: 'Build a new form from scratch',
      icon: <AddIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/form-builder'),
      color: 'primary'
    }] : []),
    {
      title: 'View Forms',
      description: isAdmin ? 'Manage your forms' : 'Fill out available forms',
      icon: <FormsIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/forms'),
      color: 'secondary'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Debug button - remove this after testing */}
      <Button onClick={debugUser} variant="outlined" sx={{ mb: 2 }} size="small">
        Debug User Info
      </Button>
      
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {currentUser?.displayName || currentUser?.email || 'User'}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isAdmin 
            ? 'Manage your forms and track responses from your dashboard.' 
            : 'Stay updated with new forms and manage your submissions.'
          }
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={3}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    }
                  }}
                  onClick={action.action}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ color: `${action.color}.main`, mb: 2 }}>
                      {action.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Settings
          </Typography>
          
          {/* Push Notifications Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                {notificationsEnabled ? (
                  <NotificationsIcon color="primary" />
                ) : (
                  <NotificationsOffIcon color="disabled" />
                )}
                <Typography variant="h6">
                  Push Notifications
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                {isAdmin 
                  ? 'Get notified about form submissions and system updates.'
                  : 'Get instant notifications when new forms are available for you to fill out.'
                }
              </Typography>

              {notificationsEnabled ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  ✅ Notifications are enabled! You'll receive updates about {isAdmin ? 'form activity' : 'new forms'}.
                </Alert>
              ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                  📱 Enable notifications to get instant updates when {isAdmin ? 'users submit forms' : 'new forms are published'}.
                </Alert>
              )}

              <FormControlLabel
                control={
                  <Switch
                    checked={notificationsEnabled}
                    onChange={handleToggleNotifications}
                    disabled={notificationLoading}
                    color="primary"
                  />
                }
                label={notificationsEnabled ? 'Enabled' : 'Disabled'}
              />

              {!notificationsEnabled && (
                <Box mt={2}>
                  <Button
                    variant="contained"
                    onClick={handleEnableNotifications}
                    disabled={notificationLoading}
                    startIcon={<NotificationsIcon />}
                    fullWidth
                    size="small"
                  >
                    {notificationLoading ? 'Enabling...' : 'Enable Notifications'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Stats Card (for admins) */}
          {isAdmin && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Stats
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Active forms: Loading...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Total submissions: Loading...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Users with notifications: Loading...
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Recent activity will appear here...
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;