import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Stack,
  Button,
  Divider,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const ViewSubmission = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        // Reset to first page when viewing a new submission
        setCurrentPage(0);
        
        // Fetch the submission data
        const submissionDoc = await getDoc(doc(db, 'formSubmissions', submissionId));
        if (!submissionDoc.exists()) {
          setError('Submission not found');
          return;
        }
        
        const submissionData = { id: submissionDoc.id, ...submissionDoc.data() };
        
        // If there's a formId, fetch the form configuration
        if (submissionData.formId) {
          try {
            const formDoc = await getDoc(doc(db, 'forms', submissionData.formId));
            if (formDoc.exists()) {
              const formData = formDoc.data();
              // Add the form configuration to the submission data
              submissionData.formConfig = formData.formConfig;
            }
          } catch (formError) {
            console.warn('Could not fetch form configuration:', formError);
            // Continue without form config - will show raw data
          }
        }
        
        setSubmission(submissionData);
      } catch (error) {
        console.error('Error fetching submission:', error);
        setError('Error loading submission');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [submissionId]);

  const renderFormField = (field, submittedValue) => {
    const baseStyle = {
      width: '100%',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      backgroundColor: '#f9f9f9',
      color: '#333'
    };

    switch (field.type) {
      case 'text':
      case 'textarea':
        return (
          <Box sx={{ 
            ...baseStyle, 
            minHeight: field.type === 'textarea' ? '80px' : 'auto',
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit'
          }}>
            {submittedValue || <em style={{ color: '#999' }}>No answer provided</em>}
          </Box>
        );

      case 'multi-text':
        { const answers = Array.isArray(submittedValue) ? submittedValue : [];
        const count = field.textboxCount || 2;
        return (
          <Stack spacing={1}>
            {Array.from({ length: count }).map((_, idx) => (
              <Box key={idx} sx={baseStyle}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  {field.label} {idx + 1}:
                </Typography>
                {answers[idx] || <em style={{ color: '#999' }}>No answer provided</em>}
              </Box>
            ))}
          </Stack>
        ); }

      case 'select':
        return (
          <Box sx={baseStyle}>
            {submittedValue || <em style={{ color: '#999' }}>No selection made</em>}
          </Box>
        );

      case 'multi-select':
        { const selectedOptions = Array.isArray(submittedValue) ? submittedValue : [];
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option, idx) => (
                <Chip key={idx} label={option} size="small" color="primary" />
              ))
            ) : (
              <em style={{ color: '#999' }}>No options selected</em>
            )}
          </Box>
        ); }

      case 'radio':
        return (
          <Box>
            {field.options?.map((option, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: '2px solid #ddd',
                    backgroundColor: submittedValue === option ? '#1976d2' : 'transparent',
                    mr: 1
                  }}
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: submittedValue === option ? 'bold' : 'normal',
                    color: submittedValue === option ? '#1976d2' : 'text.primary'
                  }}
                >
                  {option}
                </Typography>
              </Box>
            ))}
          </Box>
        );

      case 'checkbox':
        { const checkedOptions = Array.isArray(submittedValue) ? submittedValue : [];
        return (
          <Box>
            {field.options?.map((option, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    border: '2px solid #ddd',
                    backgroundColor: checkedOptions.includes(option) ? '#1976d2' : 'transparent',
                    mr: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {checkedOptions.includes(option) && (
                    <Typography sx={{ color: 'white', fontSize: '12px' }}>✓</Typography>
                  )}
                </Box>
                <Typography 
                  variant="body2"
                  sx={{ 
                    fontWeight: checkedOptions.includes(option) ? 'bold' : 'normal',
                    color: checkedOptions.includes(option) ? '#1976d2' : 'text.primary'
                  }}
                >
                  {option}
                </Typography>
              </Box>
            ))}
          </Box>
        ); }

      case 'boolean':
        return (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  border: '2px solid #ddd',
                  backgroundColor: submittedValue === 'yes' ? '#1976d2' : 'transparent',
                  mr: 1
                }}
              />
              <Typography 
                variant="body2"
                sx={{ 
                  fontWeight: submittedValue === 'yes' ? 'bold' : 'normal',
                  color: submittedValue === 'yes' ? '#1976d2' : 'text.primary'
                }}
              >
                Yes
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  border: '2px solid #ddd',
                  backgroundColor: submittedValue === 'no' ? '#1976d2' : 'transparent',
                  mr: 1
                }}
              />
              <Typography 
                variant="body2"
                sx={{ 
                  fontWeight: submittedValue === 'no' ? 'bold' : 'normal',
                  color: submittedValue === 'no' ? '#1976d2' : 'text.primary'
                }}
              >
                No
              </Typography>
            </Box>
          </Box>
        );

      case 'slider':
        return (
          <Box sx={{ px: 1 }}>
            <Box sx={{ 
              width: '100%', 
              height: '6px', 
              backgroundColor: '#e0e0e0', 
              borderRadius: '3px',
              position: 'relative',
              mb: 2
            }}>
              <Box
                sx={{
                  position: 'absolute',
                  left: `${((submittedValue - (field.min || 0)) / ((field.max || 100) - (field.min || 0))) * 100}%`,
                  top: '-5px',
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#1976d2',
                  borderRadius: '50%',
                  transform: 'translateX(-50%)'
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption">{field.min || 0}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Value: {submittedValue || 'Not answered'}
              </Typography>
              <Typography variant="caption">{field.max || 100}</Typography>
            </Box>
          </Box>
        );

      case 'rating':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating
              value={Number(submittedValue) || 0}
              readOnly
              precision={1}
              size="large"
              icon={<StarIcon fontSize="inherit" />}
              emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />}
            />
            <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
              {submittedValue || 0}/5
            </Typography>
          </Box>
        );

      case 'file':
      case 'image':
        { const files = Array.isArray(submittedValue) ? submittedValue : [];
        return (
          <Box>
            {files.length > 0 ? (
              <Stack spacing={1}>
                {files.map((file, idx) => (
                  <Card key={idx} variant="outlined" sx={{ p: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {file.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(file.size / 1024).toFixed(1)} KB
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {file.type}
                    </Typography>
                  </Card>
                ))}
              </Stack>
            ) : (
              <em style={{ color: '#999' }}>No files uploaded</em>
            )}
          </Box>
        ); }

      case 'ranking':
        { const rankings = submittedValue || {};
        return (
          <Box>
            {field.options?.map((option, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
                <Typography sx={{ flex: 1 }}>{option}</Typography>
                <Chip 
                  label={rankings[option] ? `Rank: ${rankings[option]}` : 'Not ranked'}
                  size="small"
                  color={rankings[option] ? 'primary' : 'default'}
                  variant="outlined"
                />
              </Box>
            ))}
          </Box>
        ); }

      default:
        return (
          <Box sx={baseStyle}>
            {submittedValue || <em style={{ color: '#999' }}>No answer provided</em>}
          </Box>
        );
    }
  };

  const handleBackToSubmissions = () => {
    navigate(-1); // Go back to previous page
  };

  const handlePrevious = () => {
    setCurrentPage(Math.max(0, currentPage - 1));
  };

  const handleNext = () => {
    if (submission?.formConfig?.pages) {
      setCurrentPage(Math.min(submission.formConfig.pages.length - 1, currentPage + 1));
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading submission...</Typography>
      </Container>
    );
  }

  if (error || !submission) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'Submission not found'}
        </Alert>
        <Button 
          variant="outlined" 
          onClick={handleBackToSubmissions}
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Submissions
        </Button>
      </Container>
    );
  }

  return (
    <>
      {/* Navigation Bar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToSubmissions}
            sx={{ mr: 2 }}
          >
            Back to Submissions
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            View Form Submission
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Submission Info Header */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            {submission.formTitle || 'Form Submission'}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="action" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Submitted by
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {submission?.user?.name || submission?.userId || 'Anonymous User'}
                </Typography>
                {submission?.user?.userId && (
                  <Typography variant="caption" color="text.secondary">
                    User ID: {submission.user.userId}
                  </Typography>
                )}
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon color="action" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Submitted on
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {new Date(submission.submittedAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 4, minHeight: '60vh' }}>
          <Box sx={{ minHeight: '400px' }}>
            {!submission.formConfig?.pages ? (
              <Alert severity="warning" sx={{ mb: 3 }}>
                Form configuration not available. Showing raw form data:
                <Box sx={{ mt: 2 }}>
                  {Object.entries(submission.formData || {}).map(([key, value]) => (
                    <Box key={key} sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {key}:
                      </Typography>
                      <Typography variant="body2" sx={{ ml: 2 }}>
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Alert>
            ) : (
              // Show only current page
              (() => {
                const page = submission.formConfig.pages[currentPage];
                if (!page) return null;

                return (
                  <Box>
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                      <Typography variant="h5" component="h3" gutterBottom sx={{ color: 'primary.main' }}>
                        {page.title}
                      </Typography>
                      {page.description && (
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                          {page.description}
                        </Typography>
                      )}
                    </Box>

                    {page.fields.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography color="text.secondary" variant="h6">
                          No fields on this page
                        </Typography>
                      </Box>
                    ) : (
                    <Stack spacing={3}>
  {page.fields.map((field, idx) => {
    let questionNumber = idx + 1;
    if (submission.formConfig?.pages && currentPage > 0) {
      questionNumber += submission.formConfig.pages
        .slice(0, currentPage)
        .reduce((acc, p) => acc + (p.fields?.length || 0), 0);
    }
    return (
      <Paper key={field.id || idx} elevation={2} sx={{ p: 3, mb: 2 }}>
        <Typography
          variant="body1"
          component="label"
          sx={{
            display: 'block',
            fontWeight: 600,
            mb: 2,
            color: 'text.primary'
          }}
        >
          {questionNumber}. {field.label}
          {field.required && (
            <Typography
              component="span"
              sx={{ color: 'error.main', ml: 0.5 }}
            >
              *
            </Typography>
          )}
        </Typography>
        <Box sx={{ mb: 2 }}>
          {renderFormField(field, submission.formData?.[field.id])}
        </Box>
      </Paper>
    );
  })}
</Stack>

                    )}
                  </Box>
                );
              })()
            )}
          </Box>

          {/* Navigation Controls */}
          {submission.formConfig?.pages && submission.formConfig.pages.length > 1 && (
            <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid', borderColor: 'grey.200' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={handlePrevious}
                  disabled={currentPage === 0}
                  startIcon={<NavigateBeforeIcon />}
                  sx={{ minWidth: 120 }}
                >
                  Previous
                </Button>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Page {currentPage + 1} of {submission.formConfig.pages.length}
                  </Typography>
                </Box>
                
                <Button
                  variant="outlined"
                  onClick={handleNext}
                  disabled={currentPage === submission.formConfig.pages.length - 1}
                  endIcon={<NavigateNextIcon />}
                  sx={{ minWidth: 120 }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default ViewSubmission;