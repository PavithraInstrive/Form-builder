import React, { useEffect, useState } from 'react';
import {
  Container, 
  Typography, 
  Paper, 
  Box, 
  Stack, 
  Button, 
  Divider,
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select,
  Rating,
  Chip,
  Alert,
  Snackbar,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import {
  doc, 
  getDoc, 
  collection,
  addDoc,
  serverTimestamp,
  updateDoc, 
  arrayUnion
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  Star as StarIcon,
} from '@mui/icons-material';

const EditForm = () => {
  const { formId } = useParams();
  const navigate = useNavigate();

  const [formConfig, setFormConfig] = useState(null);
  const [formData, setFormData] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  console.log('formConfig:', formConfig);

  useEffect(() => {
    const fetchFormAndSubmission = async () => {
      try {
        const formDocRef = doc(db, 'forms', formId);
        const formSnap = await getDoc(formDocRef);
        if (!formSnap.exists()) {
          console.error('Form config not found!');
          setSubmitError('Form not found!');
          return;
        }
        const formDataFromFirestore = formSnap.data();
        setFormConfig(formDataFromFirestore.formConfig);
      } catch (error) {
        console.error('Error fetching data:', error);
        setSubmitError('Error loading form. Please try again.');
      }
    };
    fetchFormAndSubmission();
  }, [formId]);

  const handleFormDataChange = (fieldId, value, isCheckbox = false, isMultiSelect = false) => {
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
      } else if (isMultiSelect) {
        // Handle multi-select - store as array
        return {
          ...prev,
          [fieldId]: value
        };
      } else {
        return {
          ...prev,
          [fieldId]: value
        };
      }
    });

    // Clear validation error for this field when user interacts
    if (validationErrors[fieldId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleFileChange = (fieldId, files) => {
    handleFormDataChange(fieldId, files);
  };

  const handleRankingChange = (fieldId, option, rank) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        [option]: rank
      }
    }));

    // Clear validation error
    if (validationErrors[fieldId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validatePage = () => {
    const page = formConfig.pages[currentPage];
    const errors = {};
    let hasError = false;

    page.fields.forEach((field) => {
      if (field.required) {
        const value = formData[field.id];
        
        if (field.type === 'checkbox' || field.type === 'multi-select') {
          if (!value || !Array.isArray(value) || value.length === 0) {
            errors[field.id] = `${field.label} is required`;
            hasError = true;
          }
        } else if (field.type === 'multi-text') {
          if (!value || !Array.isArray(value) || value.every(v => !v || v.trim() === '')) {
            errors[field.id] = `${field.label} is required`;
            hasError = true;
          }
        } else if (field.type === 'ranking') {
          if (!value || Object.keys(value).length === 0) {
            errors[field.id] = `${field.label} is required`;
            hasError = true;
          }
        } else if (field.type === 'file' || field.type === 'image') {
          if (!value || !value.length) {
            errors[field.id] = `${field.label} is required`;
            hasError = true;
          }
        } else {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors[field.id] = `${field.label} is required`;
            hasError = true;
          }
        }
      }
    });

    setValidationErrors(errors);
    return !hasError;
  };

  const renderField = (field) => {
    const fieldId = field.id;
    const hasError = !!validationErrors[fieldId];

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            id={fieldId}
            value={formData[fieldId] || ''}
            onChange={(e) => handleFormDataChange(fieldId, e.target.value)}
            placeholder={field.placeholder || ''}
            style={{
              width: '100%',
              padding: '12px',
              border: hasError ? '2px solid #f44336' : '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={fieldId}
            value={formData[fieldId] || ''}
            onChange={(e) => handleFormDataChange(fieldId, e.target.value)}
            placeholder={field.placeholder || ''}
            rows={4}
            style={{
              width: '100%',
              padding: '12px',
              border: hasError ? '2px solid #f44336' : '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        );

      case 'multi-text': {
        const count = field.textboxCount || 2;
        const answers = formData[fieldId] || Array(count).fill('');

        const handleMultiTextChange = (index, value) => {
          const updated = [...answers];
          updated[index] = value;
          handleFormDataChange(fieldId, updated);
        };

        return (
          <Stack spacing={1}>
            {Array.from({ length: count }).map((_, idx) => (
              <input
                key={idx}
                type="text"
                value={answers[idx] || ''}
                onChange={(e) => handleMultiTextChange(idx, e.target.value)}
                placeholder={`${field.label} ${idx + 1}`}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: hasError ? '2px solid #f44336' : '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
            ))}
          </Stack>
        );
      }

      case 'select':
        return (
          <FormControl fullWidth size="small" error={hasError}>
            <InputLabel id={`select-label-${fieldId}`}>
              {field.placeholder || 'Select an option'}
            </InputLabel>
            <Select
              labelId={`select-label-${fieldId}`}
              id={fieldId}
              value={formData[fieldId] || ''}
              label={field.placeholder || 'Select an option'}
              onChange={(e) => handleFormDataChange(fieldId, e.target.value)}
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
          <FormControl fullWidth size="small" error={hasError}>
            <InputLabel id={`multi-select-label-${fieldId}`}>
              {field.placeholder || 'Select options'}
            </InputLabel>
            <Select
              labelId={`multi-select-label-${fieldId}`}
              id={fieldId}
              multiple
              value={formData[fieldId] || []}
              onChange={(e) => handleFormDataChange(fieldId, e.target.value, false, true)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
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
                  name={fieldId}
                  value={option}
                  checked={formData[fieldId] === option}
                  onChange={(e) => handleFormDataChange(fieldId, e.target.value)}
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
                  name={`${fieldId}_${idx}`}
                  value={option}
                  checked={(formData[fieldId] || []).includes(option)}
                  onChange={() => handleFormDataChange(fieldId, option, true)}
                  style={{ marginRight: '8px' }}
                />
                <Typography variant="body2">{option}</Typography>
              </Box>
            ))}
          </Box>
        );

      case 'boolean':
        return (
          <Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name={fieldId} 
                  value="yes" 
                  checked={formData[fieldId] === 'yes'}
                  onChange={(e) => handleFormDataChange(fieldId, e.target.value)}
                  style={{ marginRight: '8px' }}
                /> 
                <Typography variant="body2">Yes</Typography>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name={fieldId} 
                  value="no" 
                  checked={formData[fieldId] === 'no'}
                  onChange={(e) => handleFormDataChange(fieldId, e.target.value)}
                  style={{ marginRight: '8px' }}
                /> 
                <Typography variant="body2">No</Typography>
              </label>
            </Box>
          </Box>
        );

      case 'slider':
        return (
          <Box sx={{ px: 1 }}>
            <input
              type="range"
              id={fieldId}
              min={field.min || 0}
              max={field.max || 100}
              value={formData[fieldId] || field.min || 0}
              onChange={(e) => handleFormDataChange(fieldId, Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption">{field.min || 0}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                {formData[fieldId] || field.min || 0}
              </Typography>
              <Typography variant="caption">{field.max || 100}</Typography>
            </Box>
          </Box>
        );

      case 'rating':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating
              name={fieldId}
              value={Number(formData[fieldId]) || 0}
              onChange={(event, newValue) => {
                handleFormDataChange(fieldId, newValue);
              }}
              precision={1}
              size="large"
              icon={<StarIcon fontSize="inherit" />}
              emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
            />
            <Typography variant="body2" sx={{ ml: 1 }}>
              {formData[fieldId] || 0}/5
            </Typography>
          </Box>
        );

      case 'file':
        return (
          <Box>
            <input
              type="file"
              id={fieldId}
              onChange={(e) => handleFileChange(fieldId, e.target.files)}
              multiple={field.multiple}
              style={{
                width: '100%',
                padding: '8px',
                border: hasError ? '2px solid #f44336' : '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
            {formData[fieldId] && formData[fieldId].length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {formData[fieldId].length} file(s) selected
              </Typography>
            )}
          </Box>
        );

      case 'image':
        return (
          <Box>
            <input
              type="file"
              id={fieldId}
              accept="image/*"
              onChange={(e) => handleFileChange(fieldId, e.target.files)}
              multiple={field.multiple}
              style={{
                width: '100%',
                padding: '8px',
                border: hasError ? '2px solid #f44336' : '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
            {formData[fieldId] && formData[fieldId].length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {formData[fieldId].length} image(s) selected
              </Typography>
            )}
          </Box>
        );

      case 'ranking':
        return (
          <Box>
            {field.options?.map((option, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
                <Typography sx={{ flex: 1 }}>{option}</Typography>
                <FormControl size="small" sx={{ minWidth: 80 }}>
                  <Select
                    value={formData[fieldId]?.[option] || ''}
                    onChange={(e) => handleRankingChange(fieldId, option, e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">-</MenuItem>
                    {[...Array(field.options.length)].map((_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        {i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            ))}
          </Box>
        );

      default:
        return (
          <input
            type="text"
            id={fieldId}
            value={formData[fieldId] || ''}
            onChange={(e) => handleFormDataChange(fieldId, e.target.value)}
            placeholder={field.placeholder || ''}
            style={{
              width: '100%',
              padding: '12px',
              border: hasError ? '2px solid #f44336' : '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        );
    }
  };

  // Helper function to convert FileList objects to serializable data
  const processFormDataForStorage = (data) => {
    const processedData = {};
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      
      if (value && value instanceof FileList) {
        // Convert FileList to array of file metadata
        processedData[key] = Array.from(value).map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        }));
      } else if (value && typeof value === 'object' && value.constructor === FileList) {
        // Alternative check for FileList
        processedData[key] = Array.from(value).map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        }));
      } else {
        processedData[key] = value;
      }
    });
    
    return processedData;
  };

  const handleSubmit = async () => {
    // Validate all pages
    let allValid = true;
    for (let i = 0; i < formConfig.pages.length; i++) {
      setCurrentPage(i);
      if (!validatePage()) {
        allValid = false;
        break;
      }
    }

    if (!allValid) {
      setSubmitError('Please fill in all required fields.');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        setSubmitError('User not logged in');
        return;
      }

      // Process form data to handle FileList objects
      const processedFormData = processFormDataForStorage(formData);     
       const userDetails = JSON.parse(localStorage.getItem('userDetails'));


      const submissionData = {
        user: {userId: user.uid, name: userDetails.name},
        formTitle: formConfig.formTitle,
        formId,
        formData: processedFormData,
        submittedAt: new Date().toISOString(),
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'formSubmissions'), submissionData);

      const formDocRef = doc(db, 'forms', formId);
      await updateDoc(formDocRef, {
        submittedUserIds: arrayUnion(user.uid), 
      });

      setSubmitSuccess(true);
      
      // Navigate to results after a short delay
      setTimeout(() => {
        navigate('/results', {
          state: {
            formData: processedFormData,
            formConfig,
          },
        });
      }, 2000);

    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('Error submitting form. Please try again.');
    }
  };

  if (!formConfig) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography>Loading form...</Typography>
        </Paper>
      </Container>
    );
  }

  const current = formConfig.pages[currentPage];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {formConfig.formTitle || 'Form'}
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            {current.title}
          </Typography>
          {current.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {current.description}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            Page {currentPage + 1} of {formConfig.pages.length}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />

        {Object.keys(validationErrors).length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Please fill in all required fields before proceeding.
          </Alert>
        )}

        <Stack spacing={3}>
          {current.fields.map((field) => (
            <Box key={field.id}>
              <Typography 
                variant="body1" 
                component="label" 
                htmlFor={field.id}
                sx={{ 
                  display: 'block',
                  fontWeight: 500,
                  mb: 1,
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
              {renderField(field)}
              {validationErrors[field.id] && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {validationErrors[field.id]}
                </Typography>
              )}
            </Box>
          ))}
        </Stack>

        <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid', borderColor: 'grey.200' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<NavigateBeforeIcon />}
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              sx={{ minWidth: 120 }}
            >
              Previous
            </Button>
            
            {currentPage === formConfig.pages.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                color="success"
                sx={{ minWidth: 120 }}
              >
                Submit Form
              </Button>
            ) : (
              <Button
                variant="contained"
                endIcon={<NavigateNextIcon />}
                onClick={() => {
                  if (validatePage()) setCurrentPage((prev) => prev + 1);
                }}
                sx={{ minWidth: 120 }}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Success/Error Snackbars */}
      <Snackbar
        open={submitSuccess}
        autoHideDuration={6000}
        onClose={() => setSubmitSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSubmitSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Form submitted successfully! Redirecting to results...
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
    </Container>
  );
};

export default EditForm;