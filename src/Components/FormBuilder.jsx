import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Visibility as VisibilityIcon,
  Code as CodeIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import FormFieldsEditor from './FormFieldsEditor';

const FormBuilder = () => {
  const navigate = useNavigate();
  
  // Start with null to indicate loading state
  const [formConfig, setFormConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedField, setSelectedField] = useState(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  // Default form config
  const getDefaultFormConfig = () => ({
    pages: [
      {
        id: `page_${Date.now()}`,
        title: "Page 1",
        description: "",
        fields: [
          {
            id: Date.now().toString(),
            type: 'text',
            label: 'Text Field',
            placeholder: 'Enter text',
            required: false,
          },
        ]
      }
    ]
  });

  // Load saved form config from localStorage on component mount
  useEffect(() => {
    console.log('FormBuilder: Loading from localStorage...');
    
    try {
      const savedConfig = localStorage.getItem('formBuilderConfig');
      console.log('FormBuilder: Raw saved config:', savedConfig);
      
      if (savedConfig && savedConfig !== 'undefined' && savedConfig !== 'null') {
        const parsedConfig = JSON.parse(savedConfig);
        console.log('FormBuilder: Parsed config:', parsedConfig);
        
        // Validate the loaded config structure
        if (parsedConfig && parsedConfig.pages && Array.isArray(parsedConfig.pages) && parsedConfig.pages.length > 0) {
          console.log('FormBuilder: Using saved config');
          setFormConfig(parsedConfig);
        } else {
          console.log('FormBuilder: Invalid saved config, using default');
          setFormConfig(getDefaultFormConfig());
        }
      } else {
        console.log('FormBuilder: No saved config found, using default');
        setFormConfig(getDefaultFormConfig());
      }
    } catch (error) {
      console.error('FormBuilder: Failed to load saved form config:', error);
      setFormConfig(getDefaultFormConfig());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save form config to localStorage whenever it changes (but only after initial load)
  useEffect(() => {
    if (formConfig && !isLoading) {
      try {
        const configToSave = JSON.stringify(formConfig);
        localStorage.setItem('formBuilderConfig', configToSave);
        console.log('FormBuilder: Saved config to localStorage:', configToSave);
      } catch (error) {
        console.error('FormBuilder: Failed to save form config:', error);
      }
    }
  }, [formConfig, isLoading]);

  // Show loading state
  if (isLoading || !formConfig) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h6">Loading form builder...</Typography>
      </Container>
    );
  }

  const fieldTypes = [
    { type: 'text', label: 'Text Input' },
    { type: 'select', label: 'Dropdown' },
    { type: 'radio', label: 'Radio Button' },
    { type: 'checkbox', label: 'Checkbox' },
  ];

  const renderFormField = (field, isPreview = false) => {
    const baseProps = {
      id: field.id,
      required: field.required,
      placeholder: field.placeholder || '',
      disabled: !isPreview,
      fullWidth: true,
      variant: "outlined",
      size: "small"
    };

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
          <select
            {...baseProps}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="">Select an option</option>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
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

  const handlePreview = () => {
    // Force save current state before navigating
    try {
      const configToSave = JSON.stringify(formConfig);
      localStorage.setItem('formBuilderConfig', configToSave);
      console.log('FormBuilder: Saved before preview:', configToSave);
      
      // Small delay to ensure localStorage write completes
      setTimeout(() => {
        navigate('/preview');
      }, 100);
    } catch (error) {
      console.error('FormBuilder: Failed to save before preview:', error);
      // Navigate anyway
      navigate('/preview');
    }
  };

  const handleRemovePage = (pageIndex) => {
    const newPages = formConfig.pages.filter((page, idx) => idx !== pageIndex);
    
    // If no pages left, create a default page
    if (newPages.length === 0) {
      const defaultPage = {
        id: `page_${Date.now()}`,
        title: "New Page",
        description: "",
        fields: []
      };
      setFormConfig({ ...formConfig, pages: [defaultPage] });
    } else {
      setFormConfig({ ...formConfig, pages: newPages });
    }
    
    // Clear selected field if it was on the deleted page
    setSelectedField(null);
  };

  const handleRemoveField = (pageIndex, fieldIndex) => {
    const newPages = formConfig.pages.map((page, idx) => {
      if (idx !== pageIndex) return page;

      const newFields = page.fields.filter((field, idx) => idx !== fieldIndex);
      return { ...page, fields: newFields };
    });
    setFormConfig({ ...formConfig, pages: newPages });
    
    // Clear selected field if it was the deleted one
    const deletedField = formConfig.pages[pageIndex].fields[fieldIndex];
    if (selectedField?.id === deletedField?.id) {
      setSelectedField(null);
    }
  };

  const handleResetForm = () => {
    setResetDialogOpen(true);
  };

  const confirmReset = () => {
    // Clear localStorage
    try {
      localStorage.removeItem('formBuilderConfig');
      console.log('FormBuilder: Cleared localStorage');
    } catch (error) {
      console.error('FormBuilder: Failed to clear localStorage:', error);
    }

    // Reset to default config
    const defaultConfig = getDefaultFormConfig();
    setFormConfig(defaultConfig);
    setSelectedField(null);
    setResetDialogOpen(false);

    console.log('FormBuilder: Reset to default configuration');
  };

  const cancelReset = () => {
    setResetDialogOpen(false);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 1 }}>
      {/* Header */}
   <Box sx={{ mb: 4 }}>
  <Stack direction="row" spacing={2} alignItems="center">
    <Typography variant="h4" gutterBottom sx={{ flexGrow: 1 }}>
      QuickForm
    </Typography>
    
    <Button
      variant="outlined"
      onClick={handleResetForm}
      startIcon={<RefreshIcon />}
      size="large"
      color="error"
    >
      Reset Form
    </Button>
    
    <Button
      variant="outlined"
      onClick={handlePreview}
      startIcon={<VisibilityIcon />}
      size="large"
    >
      Preview Form
    </Button>
  </Stack>
</Box>


      {/* Form Builder Content */}
      <FormFieldsEditor
        pages={formConfig.pages}
        setPages={(newPages) => setFormConfig({ ...formConfig, pages: newPages })}
        selectedField={selectedField}
        setSelectedField={setSelectedField}
        renderFormField={(field) => renderFormField(field, false)}
        fieldTypes={fieldTypes}
        onRemovePage={handleRemovePage}
        onRemoveField={handleRemoveField}
      />

      {/* Reset Confirmation Dialog */}
      <Dialog
        open={resetDialogOpen}
        onClose={cancelReset}
        aria-labelledby="reset-dialog-title"
        aria-describedby="reset-dialog-description"
      >
        <DialogTitle id="reset-dialog-title">
          Reset Form Builder?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="reset-dialog-description">
            Are you sure you want to reset?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelReset} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmReset} color="error" variant="contained" autoFocus>
            Reset Everything
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FormBuilder;