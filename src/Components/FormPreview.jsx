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
} from '@mui/material';
import {
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const FormPreview = () => {
  const navigate = useNavigate();
  const [currentPreviewPage, setCurrentPreviewPage] = useState(0);
  const [formData, setFormData] = useState({});
  const [formConfig, setFormConfig] = useState({ pages: [] });
  const [validationErrors, setValidationErrors] = useState({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // Load form config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('formBuilderConfig');
    if (savedConfig) {
      try {
        setFormConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Failed to load form config:', error);
      }
    }
  }, []);

  // Validate required fields
  const validateCurrentPage = () => {
    const currentPage = formConfig.pages[currentPreviewPage];
    const errors = {};
    let hasErrors = false;

    currentPage.fields.forEach(field => {
      if (field.required) {
        const value = formData[field.id];
        
        if (field.type === 'checkbox') {
          if (!value || !Array.isArray(value) || value.length === 0) {
            errors[field.id] = `${field.label} is required`;
            hasErrors = true;
          }
        } else {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors[field.id] = `${field.label} is required`;
            hasErrors = true;
          }
        }
      }
    });

    setValidationErrors(errors);
    return !hasErrors;
  };

  // Validate all pages
  const validateAllPages = () => {
    const allErrors = {};
    let hasErrors = false;

    formConfig.pages.forEach((page, pageIndex) => {
      page.fields.forEach(field => {
        if (field.required) {
          const value = formData[field.id];
          
          if (field.type === 'checkbox') {
            if (!value || !Array.isArray(value) || value.length === 0) {
              allErrors[field.id] = `${field.label} is required`;
              hasErrors = true;
            }
          } else {
            if (!value || (typeof value === 'string' && value.trim() === '')) {
              allErrors[field.id] = `${field.label} is required`;
              hasErrors = true;
            }
          }
        }
      });
    });

    setValidationErrors(allErrors);
    return !hasErrors;
  };

  const currentPage = formConfig.pages[currentPreviewPage];
  const totalPages = formConfig.pages.length;

  const handleFormDataChange = (fieldId, value, isCheckbox = false) => {
    setFormData((prev) => {
      if (isCheckbox) {
        // Handle checkbox groups - store as array
        const currentValues = prev[fieldId] || [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        return {
          ...prev,
          [fieldId]: newValues
        };
      } else {
        return {
          ...prev,
          [fieldId]: value
        };
      }
    });

    // Clear validation error for this field when user types
    if (validationErrors[fieldId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
    setShowValidationErrors(false);
  };

  const renderFormField = (field, isPreview = true) => {
    const baseProps = {
      id: field.id,
      required: field.required,
      placeholder: field.placeholder || '',
      disabled: !isPreview,
      fullWidth: true,
      variant: "outlined",
      size: "small"
    };

    if (isPreview) {
      if (['text'].includes(field.type)) {
        baseProps.value = formData[field.id] || '';
        baseProps.onChange = (e) => handleFormDataChange(field.id, e.target.value);
      }
    }

    switch (field.type) {
      case 'text':
        return (
          <input
            type={field.type}
            {...baseProps}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth size="small" error={!!validationErrors[field.id]}>
            <InputLabel id={`select-label-${field.id}`}>
              {field.placeholder || 'Select an option'}
            </InputLabel>
            <Select
              labelId={`select-label-${field.id}`}
              id={field.id}
              value={formData[field.id] || ''}
              label={field.placeholder || 'Select an option'}
              onChange={(e) => isPreview && handleFormDataChange(field.id, e.target.value)}
              disabled={!isPreview}
              required={field.required}
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
                  name={field.id}
                  value={option}
                  checked={formData[field.id] === option}
                  onChange={(e) => isPreview && handleFormDataChange(field.id, e.target.value)}
                  disabled={!isPreview}
                  style={{ marginRight: '8px' }}
                />
                <Typography variant="body2">{option}</Typography>
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
                  name={`${field.id}_${idx}`}
                  value={option}
                  checked={(formData[field.id] || []).includes(option)}
                  onChange={(e) => isPreview && handleFormDataChange(field.id, option, true)}
                  disabled={!isPreview}
                  style={{ marginRight: '8px' }}
                />
                <Typography variant="body2">{option}</Typography>
              </Box>
            ))}
          </Box>
        );

      default:
        return (
          <input
            type="text"
            {...baseProps}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        );
    }
  };

  const handlePrevious = () => {
    setCurrentPreviewPage(Math.max(0, currentPreviewPage - 1));
    setShowValidationErrors(false);
    setValidationErrors({});
  };

  const handleNext = () => {
    if (validateCurrentPage()) {
      setCurrentPreviewPage(Math.min(totalPages - 1, currentPreviewPage + 1));
      setShowValidationErrors(false);
      setValidationErrors({});
    } else {
      setShowValidationErrors(true);
    }
  };

  const handleSubmit = () => {
    if (!validateAllPages()) {
      setShowValidationErrors(true);
      // Go to first page with errors
      const firstErrorPage = formConfig.pages.findIndex(page => 
        page.fields.some(field => validationErrors[field.id])
      );
      if (firstErrorPage !== -1) {
        setCurrentPreviewPage(firstErrorPage);
      }
      return;
    }

    // Calculate results by comparing answers
    const results = [];
    let totalQuestions = 0;
    let correctAnswers = 0;

    formConfig.pages.forEach(page => {
      page.fields.forEach(field => {
        if (field.correctAnswer) {
          totalQuestions++;
          const userAnswer = formData[field.id];
          const correctAnswer = field.correctAnswer;
          let isCorrect = false;

          if (field.type === 'checkbox') {
            // For checkboxes, compare arrays
            const correctAnswersArray = correctAnswer.split(',').map(a => a.trim());
            const userAnswersArray = userAnswer || [];
            isCorrect = correctAnswersArray.length === userAnswersArray.length &&
                       correctAnswersArray.every(answer => userAnswersArray.includes(answer));
          } else {
            // For other types, direct comparison
            isCorrect = String(userAnswer || '').toLowerCase().trim() === 
                       String(correctAnswer).toLowerCase().trim();
          }

          if (isCorrect) correctAnswers++;

          results.push({
            fieldId: field.id,
            fieldLabel: field.label,
            fieldType: field.type,
            userAnswer: userAnswer,
            correctAnswer: correctAnswer,
            isCorrect: isCorrect
          });
        }
      });
    });

    // Store results and form data in localStorage
    const submissionData = {
      formData,
      results,
      totalQuestions,
      correctAnswers,
      score: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
      submittedAt: new Date().toISOString()
    };

    localStorage.setItem('formSubmissionResults', JSON.stringify(submissionData));
    
    // Navigate to results page
    navigate('/results');
  };

  const handleBackToBuilder = () => {
    navigate('/');
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
            Form Preview
          </Typography>
         
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, minHeight: '70vh' }}>
          <Box sx={{ minHeight: '400px' }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h4" component="h2" gutterBottom>
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
                {currentPage.fields.map((field) => (
                  <Box key={field.id}>
                    <Typography 
                      variant="body1" 
                      component="label" 
                      htmlFor={field.id}
                      sx={{ 
                        // mb: 1,
                        display: 'block',
                        fontWeight: 500,
                        color: validationErrors[field.id] ? 'error.main' : 'text.primary'
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
                    </Typography>
                    <Box sx={{ 
                      // border: validationErrors[field.id] ? '2px solid' : 'none',
                      borderColor: 'error.min',
                      // borderRadius: 1,
                      p: validationErrors[field.id] ? 1 : 0
                    }}>
                      {renderFormField(field, true)}
                    </Box>
                    {validationErrors[field.id] && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        {validationErrors[field.id]}
                      </Typography>
                    )}
                  </Box>
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
                  Submit
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
    </>
  );
};

export default FormPreview;