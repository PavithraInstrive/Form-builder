import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import BarChartIcon from '@mui/icons-material/BarChart';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Import the FormAnalytics component we created earlier
import FormAnalytics from '../Components/FormAnalytics'; // Adjust the import path as needed

const FormSubmissionsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const formId = searchParams.get('formId');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);

  console.log(submissions);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!formId) return;
      try {
        const q = query(collection(db, 'formSubmissions'), where('formId', '==', formId));
        const snapshot = await getDocs(q);
        console.log('Snapshot:', snapshot.docs);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSubmissions(data);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [formId]);

  const handleViewSubmission = (submissionId) => {
    // Navigate to view submission page
    navigate(`/view-submission/${submissionId}`);
  };

  const handleShowAnalytics = () => {
    setShowAnalytics(true);
  };

  const handleOpenAnalyticsDialog = () => {
    setAnalyticsDialogOpen(true);
  };

  const handleCloseAnalyticsDialog = () => {
    setAnalyticsDialogOpen(false);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading Submissions...</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      {/* Header with Analytics Button in Right Corner */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Form Submissions
          </Typography>
        </Box>
        
        {/* Analytics Button in Right Corner */}
        {formId && (
          <Button
            variant="contained"
            startIcon={<BarChartIcon />}
            onClick={handleOpenAnalyticsDialog}
            size="large"
            sx={{ 
              minWidth: 140,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
              }
            }}
          >
            View Analytics
          </Button>
        )}
      </Box>

      {/* Analytics Dialog */}
      <Dialog 
        open={analyticsDialogOpen} 
        onClose={handleCloseAnalyticsDialog}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { height: '90vh', maxHeight: '90vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">Form Analytics</Typography>
            <IconButton onClick={handleCloseAnalyticsDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          <Box sx={{ height: '100%', overflow: 'auto', p: 2 }}>
            {formId && <FormAnalytics formId={formId} />}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAnalyticsDialog} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {submissions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No submissions found for this form.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Users haven't submitted any responses yet.
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ p: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon />
                    User
                  </Box>
                </TableCell>
                <TableCell>Submitted At</TableCell>
                <TableCell>Form Title</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow 
                  key={submission.id}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: 'action.hover',
                      cursor: 'pointer' 
                    } 
                  }}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {submission?.user?.name || submission.userId || 'Anonymous User'}
                      </Typography>
                      {submission?.user?.email && (
                        <Typography variant="caption" color="text.secondary">
                          {submission.user.email}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(submission.submittedAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {submission.formTitle || 'Untitled Form'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewSubmission(submission.id)}
                      sx={{ minWidth: 'auto' }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* {showAnalytics && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>Analytics (Bar Chart)</Typography>
          <Typography variant="body2" color="text.secondary">
            (This is a placeholder. Integrate your analytics/chart component here.)
          </Typography>
          <Button variant="outlined" onClick={() => setShowAnalytics(false)} sx={{ mt: 2 }}>Close</Button>
        </Box>
      )} */}
    </Container>
  );
};

export default FormSubmissionsPage;