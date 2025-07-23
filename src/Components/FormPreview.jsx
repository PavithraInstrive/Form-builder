import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Stack,
  Divider,
  AppBar,
  Toolbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Chip,
  Snackbar,
} from '@mui/material';
import {
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp,query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useFormContext } from '../FormContext';

const FormPreview = () => {
  const { formBuilderConfig, userRole } = useFormContext();
  const navigate = useNavigate();
  const [currentPreviewPage, setCurrentPreviewPage] = useState(0);

  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const currentPage = formBuilderConfig.pages[currentPreviewPage];
  const totalPages = formBuilderConfig.pages.length;

  const renderFormField = (field) => {
    // All fields are disabled for preview - just showing structure
    const baseStyle = {
      width: '100%',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      backgroundColor: '#f5f5f5',
      cursor: 'not-allowed'
    };

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            placeholder={field.placeholder || 'Text input field'}
            disabled
            style={baseStyle}
          />
        );

      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder || 'Long text input field'}
            disabled
            rows={4}
            style={{
              ...baseStyle,
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        );

      case 'multi-text': {
        const count = field.textboxCount || 2;
        return (
          <Stack spacing={1}>
            {Array.from({ length: count }).map((_, idx) => (
              <input
                key={idx}
                type="text"
                placeholder={`${field.label} ${idx + 1}`}
                disabled
                style={baseStyle}
              />
            ))}
          </Stack>
        );
      }

      case 'select':
        return (
          <FormControl fullWidth size="small" disabled>
            <InputLabel>{field.placeholder || 'Select an option'}</InputLabel>
            <Select
              value=""
              label={field.placeholder || 'Select an option'}
            >
              {field.options?.map((option, idx) => (
                <MenuItem key={idx} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'multi-select':
        return (
          <FormControl fullWidth size="small" disabled>
            <InputLabel>{field.placeholder || 'Select options'}</InputLabel>
            <Select
              multiple
              value={[]}
              renderValue={() => (
                <Typography variant="body2" color="text.secondary">
                  Multiple selection dropdown
                </Typography>
              )}
            >
              {field.options?.map((option, idx) => (
                <MenuItem key={idx} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'radio':
        return (
          <Box>
            {field.options?.map((option, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <input
                  type="radio"
                  disabled
                  style={{ marginRight: '8px' }}
                />
                <Typography variant="body2" color="text.secondary">{option}</Typography>
              </Box>
            ))}
          </Box>
        );

      case 'checkbox':
        return (
          <Box>
            {field.options?.map((option, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <input
                  type="checkbox"
                  disabled
                  style={{ marginRight: '8px' }}
                />
                <Typography variant="body2" color="text.secondary">{option}</Typography>
              </Box>
            ))}
          </Box>
        );

      case 'boolean':
        return (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input 
                type="radio" 
                disabled
                style={{ marginRight: '8px' }}
              /> 
              <Typography variant="body2" color="text.secondary">Yes</Typography>
            </label>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input 
                type="radio" 
                disabled
                style={{ marginRight: '8px' }}
              /> 
              <Typography variant="body2" color="text.secondary">No</Typography>
            </label>
          </Box>
        );

      case 'slider':
        return (
          <Box sx={{ px: 1 }}>
            <input
              type="range"
              min={field.min || 0}
              max={field.max || 100}
              value={Math.round(((field.min || 0) + (field.max || 100)) / 2)}
              disabled
              style={{ width: '100%' }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption" color="text.secondary">{field.min || 0}</Typography>
              <Typography variant="caption" color="text.secondary">
                Slider: {field.min || 0} - {field.max || 100}
              </Typography>
              <Typography variant="caption" color="text.secondary">{field.max || 100}</Typography>
            </Box>
          </Box>
        );

      case 'rating':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating
              value={0}
              readOnly
              precision={1}
              size="large"
              icon={<StarIcon fontSize="inherit" />}
              emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              Star Rating (1-5)
            </Typography>
          </Box>
        );

      case 'file':
        return (
          <Box>
            <input 
              type="file" 
              disabled
              style={{
                ...baseStyle,
                padding: '8px'
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              File upload field {field.multiple ? '(multiple files allowed)' : '(single file)'}
            </Typography>
          </Box>
        );

      case 'image':
        return (
          <Box>
            <input 
              type="file" 
              accept="image/*" 
              disabled
              style={{
                ...baseStyle,
                padding: '8px'
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Image upload field {field.multiple ? '(multiple images allowed)' : '(single image)'}
            </Typography>
          </Box>
        );

      case 'ranking':
        return (
          <Box>
            {field.options?.map((option, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
                <Typography sx={{ flex: 1 }} color="text.secondary">{option}</Typography>
                <FormControl size="small" sx={{ minWidth: 80 }} disabled>
                  <Select
                    value=""
                    displayEmpty
                  >
                    <MenuItem value="">-</MenuItem>
                    {[...Array(field.options?.length || 0)].map((_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        {i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            ))}
            <Typography variant="caption" color="text.secondary">
              Ranking field: Rank options from 1 to {field.options?.length || 0}
            </Typography>
          </Box>
        );

      default:
        return (
          <input
            type="text"
            placeholder="Default text field"
            disabled
            style={baseStyle}
          />
        );
    }
  };

  const handlePrevious = () => {
    setCurrentPreviewPage(Math.max(0, currentPreviewPage - 1));
  };

  const handleNext = () => {
    setCurrentPreviewPage(Math.min(totalPages - 1, currentPreviewPage + 1));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const formConfigData = {
        formConfig: formBuilderConfig,
        createdAt: serverTimestamp(),
        createdBy: userRole || 'admin',
        status: 'published'
      };

      const docRef = await addDoc(collection(db, 'forms'), formConfigData);
      console.log('Form configuration saved with ID:', docRef.id);
      const q = query(collection(db, 'fcmTokens'), where('role', '==', 'user'));
      const snapshot = await getDocs(q);
      const tokens = snapshot.docs.map(doc => doc.data()?.token);

      // Send push notification to all users (example: tokens fetched from backend)
      // You need to fetch all user tokens from your backend or Firestore
      // Here is a sample fetch to your backend endpoint
      try {
        const notifyRes = await fetch('http://localhost:3000/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokens: tokens,
            title: 'New Survey Available!',
            body: `A new survey "${formBuilderConfig.formTitle}" has been published. Please submit your response!`,
          })
        });
        const notifyJson = await notifyRes.json();
        console.log('Notification sent to all users:', notifyJson);
      } catch (notifyErr) {
        console.error('Error sending notification to all users:', notifyErr);
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/forms');
      }, 2000);

    } catch (error) {
      console.error('Error saving form configuration:', error);
      setSubmitError('Failed to save form. Please try again.');
    }
  };

  const handleBackToBuilder = () => {
    navigate('/form-builder');
  };

  if (!currentPage) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            No Form Configuration Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Please create a form in the builder first.
          </Typography>
          <Button
            variant="contained"
            onClick={handleBackToBuilder}
            startIcon={<ArrowBackIcon />}
          >
            Go to Form Builder
          </Button>
        </Paper>
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
            onClick={handleBackToBuilder}
            sx={{ mr: 2 }}
          >
            Back to Builder
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Form Configuration Preview
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, minHeight: '70vh' }}>
          <Box sx={{ minHeight: '400px' }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h4" component="h2" gutterBottom>
                {formBuilderConfig.formTitle || 'Form Preview'}
              </Typography>
              <Typography variant="h5" component="h3" gutterBottom>
                {currentPage.title}
              </Typography>
              {currentPage.description && (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {currentPage.description}
                </Typography>
              )}
 
              <Divider sx={{ my: 3 }} />
            </Box>

            {currentPage.fields.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary" variant="h6">
                  No fields on this page
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Add some fields in the builder to see them here
                </Typography>
              </Box>
            ) : (
              <Stack spacing={3}>
                {currentPage.fields.map((field,index) => (
                  (() => {
                    let questionNumber = index + 1;
                    if (formBuilderConfig?.pages && currentPreviewPage > 0) {
                      questionNumber += formBuilderConfig.pages
                        .slice(0, currentPreviewPage)
                        .reduce((acc, p) => acc + (p.fields?.length || 0), 0);
                    }
                    return (
                      <Paper key={field.id || index} elevation={2} sx={{ p: 3, mb: 2 }}>
                        <Typography 
                          variant="body1" 
                          component="label" 
                          sx={{ 
                            display: 'block',
                            fontWeight: 500,
                            mb: 1,
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
                          {field.hasCorrectAnswer && (
                            <Chip 
                              label="Has Answer" 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                        <Box>
                          {renderFormField(field)}
                        </Box>
                      </Paper>
                    );
                  })()
                ))}
              </Stack>
            )}
          </Box>

          {/* Navigation */}
          <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid', borderColor: 'grey.200' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                variant="outlined"
                onClick={handlePrevious}
                disabled={currentPreviewPage === 0}
                startIcon={<NavigateBeforeIcon />}
                sx={{ minWidth: 120 }}
              >
                Previous
              </Button>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Page {currentPreviewPage + 1} of {totalPages}
                </Typography>
              </Box>
              
              {currentPreviewPage === totalPages - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  endIcon={<SendIcon />}
                  sx={{ minWidth: 120 }}
                  color="success"
                >
                  Save Form
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<NavigateNextIcon />}
                  sx={{ minWidth: 120 }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* Success/Error Snackbars */}
      <Snackbar
        open={submitSuccess}
        autoHideDuration={6000}
        onClose={() => setSubmitSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSubmitSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Form submitted successfully! Redirecting to form builder...
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!submitError}
        autoHideDuration={6000}
        onClose={() => setSubmitError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSubmitError('')} severity="error" sx={{ width: '100%' }}>
          {submitError}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FormPreview;