// Dashboard.js - Updated version with admin notification support
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
  Paper,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  ListAlt as FormsIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  initializeNotifications, 
  requestNotificationPermission, 
  listenForMessages 
} from '../firebase';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); 
  const role = localStorage.getItem('userRole');
  const isAdmin = role === 'admin';
  
  // Notification states
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const [tokenInitialized, setTokenInitialized] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  console.log('Current User:', currentUser);

  // Updated: Initialize notifications for both users and admins
  useEffect(() => {
    if (currentUser) { 
      initializeUserNotifications();
      listenForMessages();
    }
  }, [currentUser]);

  const initializeUserNotifications = async () => {
    if (Notification.permission === 'granted') {
      const token = await initializeNotifications(currentUser.uid);
      if (token) {
        setTokenInitialized(true);
        console.log('FCM token initialized automatically');
      }
    } else if (Notification.permission === 'default') {
      setShowPermissionPrompt(true);
    }
  };

  const handleEnableNotifications = async () => {
    const token = await requestNotificationPermission(currentUser.uid);
    if (token) {
      setTokenInitialized(true);
      setNotificationPermission('granted');
      setShowPermissionPrompt(false);
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {currentUser?.name || currentUser?.email || 'User'}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isAdmin 
            ? 'Manage your forms and track responses from your dashboard.' 
            : 'Stay updated with new forms and manage your submissions.'
          }
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
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

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                {notificationPermission === 'granted' ? (
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
                  ? 'Get notified when users submit forms and about system updates.'
                  : 'Get instant notifications when new forms are available.'
                }
              </Typography>

              {notificationPermission === 'granted' ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Notifications are enabled! You'll receive updates about {isAdmin ? 'form submissions' : 'new forms'}.
                  {!tokenInitialized && (
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Setting up notifications...
                    </Typography>
                  )}
                </Alert>
              ) : notificationPermission === 'denied' ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Notifications are blocked. To receive updates, please enable notifications in your browser settings for this site.
                </Alert>
              ) : (
                <>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Enable notifications to get instant updates when {isAdmin ? 'users submit forms' : 'new forms are published'}.
                  </Alert>
                  <Button
                    variant="contained"
                    startIcon={<NotificationsIcon />}
                    onClick={handleEnableNotifications}
                    size="small"
                  >
                    Enable Notifications
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;