import React, { useEffect, useState } from 'react';
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
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
  PlayArrow as StartIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const FormPreviewReadonly = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [formConfig, setFormConfig] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('user');

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role || 'user');
    
    const fetchForm = async () => {
      try {
        const formDocRef = doc(db, 'forms', formId);
        const formSnap = await getDoc(formDocRef);
        
        if (!formSnap.exists()) {
          setError('Form not found');
          return;
        }
        
        const formData = formSnap.data();
        setFormConfig(formData.formConfig);
      } catch (error) {
        console.error('Error fetching form:', error);
        setError('Error loading form');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  const handlePrevious = () => {
    setCurrentPage(Math.max(0, currentPage - 1));
  };

  const handleNext = () => {
    if (formConfig?.pages) {
      setCurrentPage(Math.min(formConfig.pages.length - 1, currentPage + 1));
    }
  };

  const handleStartForm = () => {
    // Check if user is logged in
    const user = auth.currentUser;
    if (!user) {
      alert('Please log in to fill out this form');
      return;
    }
    
    // Navigate to the actual form filling page
    navigate(`/edit/${formId}`);
  };

  const handleBackToForms = () => {
    navigate('/forms');
  };

  const renderFormField = (field) => {
    const baseStyle = {
      width: '100%',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      backgroundColor: '#f9f9f9',
      cursor: 'not-allowed',
      color: '#666'
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
                  style={{ marginRight: '8px', cursor: 'not-allowed' }}
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
                  style={{ marginRight: '8px', cursor: 'not-allowed' }}
                />
                <Typography variant="body2" color="text.secondary">{option}</Typography>
              </Box>
            ))}
          </Box>
        );

      case 'boolean':
        return (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'not-allowed' }}>
              <input 
                type="radio" 
                disabled
                style={{ marginRight: '8px', cursor: 'not-allowed' }}
              /> 
              <Typography variant="body2" color="text.secondary">Yes</Typography>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'not-allowed' }}>
              <input 
                type="radio" 
                disabled
                style={{ marginRight: '8px', cursor: 'not-allowed' }}
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
              style={{ width: '100%', cursor: 'not-allowed' }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption" color="text.secondary">{field.min || 0}</Typography>
              <Typography variant="caption" color="text.secondary">
                Range: {field.min || 0} - {field.max || 100}
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
              emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />}
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              Rating Scale (1-5 stars)
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
            placeholder="Default input field"
            disabled
            style={baseStyle}
          />
        );
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading form preview...</Typography>
      </Container>
    );
  }

  if (error || !formConfig) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'Form not found'}
        </Alert>
        <Button 
          variant="outlined" 
          onClick={handleBackToForms}
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Forms
        </Button>
      </Container>
    );
  }

  const currentPageData = formConfig.pages[currentPage];
  const totalPages = formConfig.pages.length;

  return (
    <>
      {/* Navigation Bar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToForms}
            sx={{ mr: 2 }}
          >
            Back to Forms
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Form Preview
          </Typography>
          {userRole !== 'admin' && (
            <Button
              variant="contained"
              startIcon={<StartIcon />}
              onClick={handleStartForm}
              color="success"
            >
              Start Form
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, minHeight: '60vh' }}>
          <Box sx={{ minHeight: '400px' }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {formConfig.formTitle || 'Form Preview'}
              </Typography>
              <Typography variant="h5" component="h2" gutterBottom>
                {currentPageData.title}
              </Typography>
              {currentPageData.description && (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {currentPageData.description}
                </Typography>
              )}
             
              {/* <Typography variant="body2" color="text.secondary">
                Page {currentPage + 1} of {totalPages}
              </Typography> */}
              <Divider sx={{ my: 3 }} />
            </Box>

            {currentPageData.fields.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary" variant="h6">
                  No fields on this page
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  This page doesn't contain any form fields
                </Typography>
              </Box>
            ) : (
              <Stack spacing={3}>
                {currentPageData.fields.map((field) => (
                  <Paper key={field.id} elevation={2} sx={{ p: 3, mb: 2 }}>
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
                      {field.label}
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
                          label="Scored" 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      )}
                      <Typography 
                        component="span" 
                        variant="caption"
                        sx={{ color: 'text.secondary', ml: 1 }}
                      >
                        ({field.type})
                      </Typography>
                    </Typography>
                    <Box>
                      {renderFormField(field)}
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>

          {/* Navigation Controls */}
          {totalPages > 1 && (
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
                    Page {currentPage + 1} of {totalPages}
                  </Typography>

                </Box>
                
                <Button
                  variant="outlined"
                  onClick={handleNext}
                  disabled={currentPage === totalPages - 1}
                  endIcon={<NavigateNextIcon />}
                  sx={{ minWidth: 120 }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}

          {/* Call to Action */}
          {userRole !== 'admin' && (
            <Box sx={{ mt: 4, p: 3, backgroundColor: 'primary.50', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Ready to fill out this form?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Click the button below to start filling out the actual form
              </Typography>
              <Button
                variant="contained"
                onClick={handleStartForm}
                startIcon={<StartIcon />}
                size="large"
                color="success"
              >
                Start Form
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default FormPreviewReadonly;