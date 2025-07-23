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
  Divider,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Rating,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Visibility as VisibilityIcon,
  Code as CodeIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import FormFieldsEditor from './FormFieldsEditor';
import FormJsonEditor from './FormJsonEditor';
import { useFormContext } from '../FormContext';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';


const FormBuilder = () => {

  const navigate = useNavigate();
  const { formBuilderConfig, setFormBuilderConfig, getDefaultFormConfig } = useFormContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
const [generationPrompt, setGenerationPrompt] = useState('');
const [loading, setLoading] = useState(false);



  useEffect(() => {
    setIsLoading(false);

    const params = new URLSearchParams(window.location.search);
    const formId = params.get('formId');
    const isEdit = params.get('edit') === 'true';
    if (formId && isEdit) {
      const config = localStorage.getItem('formBuilderConfig');
      if (config) {
        try {
          setFormBuilderConfig(JSON.parse(config));
        } catch (e) {
          // fallback: do nothing
        }
      }
    }
  }, []);

  // Show loading state
  if (isLoading || !formBuilderConfig) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h6">Loading form builder...</Typography>
      </Container>
    );
  }

  const fieldTypes = [
    { type: 'text', label: 'Text Input' },
    { type: 'textarea', label: 'Long Text' },
    { type: 'multi-text', label: 'Multiple Textboxes' },
    { type: 'select', label: 'Dropdown' },
    { type: 'multi-select', label: 'Multi-select Dropdown' },
    { type: 'radio', label: 'Radio Button' },
    { type: 'checkbox', label: 'Checkbox' },
    { type: 'boolean', label: 'Yes/No (Boolean)' },
    { type: 'slider', label: 'Slider' },
    { type: 'rating', label: 'Rating Scale' },
    { type: 'file', label: 'File Upload' },
    { type: 'image', label: 'Image Picker' },
    { type: 'ranking', label: 'Ranking' },
  ];

  const renderFormField = (field, isPreview = false) => {
    const baseStyle = {
      width: '100%',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      backgroundColor: isPreview ? 'white' : '#f5f5f5'
    };

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            placeholder={field.placeholder || field.label}
            disabled={!isPreview}
            style={baseStyle}
          />
        );

      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder || field.label}
            disabled={!isPreview}
            rows={4}
            style={{
              ...baseStyle,
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        );

      case 'multi-text':
        return (
          <Stack spacing={1}>
            {Array.from({ length: field.textboxCount || 2 }).map((_, idx) => (
              <input
                key={idx}
                type="text"
                placeholder={`${field.label} ${idx + 1}`}
                disabled={!isPreview}
                style={{
                  ...baseStyle,
                  marginBottom: idx === (field.textboxCount || 2) - 1 ? 0 : '8px'
                }}
              />
            ))}
          </Stack>
        );

      case 'select':
        return (
          <select
            disabled={!isPreview}
            style={{
              ...baseStyle,
              backgroundColor: isPreview ? 'white' : '#f5f5f5'
            }}
          >
            <option value="">Select an option</option>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'multi-select':
        return (
          <Box>
            <select
              multiple
              disabled={!isPreview}
              style={{
                ...baseStyle,
                height: '100px',
                backgroundColor: isPreview ? 'white' : '#f5f5f5'
              }}
            >
              {field.options?.map((option, idx) => (
                <option key={idx} value={option}>{option}</option>
              ))}
            </select>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Hold Ctrl/Cmd to select multiple options
            </Typography>
          </Box>
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

      case 'boolean':
        return (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: isPreview ? 'pointer' : 'default' }}>
              <input 
                type="radio" 
                name={field.id} 
                value="yes" 
                disabled={!isPreview}
                style={{ marginRight: '8px' }}
              /> 
              <Typography variant="body2">Yes</Typography>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: isPreview ? 'pointer' : 'default' }}>
              <input 
                type="radio" 
                name={field.id} 
                value="no" 
                disabled={!isPreview}
                style={{ marginRight: '8px' }}
              /> 
              <Typography variant="body2">No</Typography>
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
              defaultValue={(field.min + field.max) / 2 || 50}
              disabled={!isPreview}
              style={{ width: '100%' }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption">{field.min || 0}</Typography>
              <Typography variant="caption">{Math.round(((field.min || 0) + (field.max || 100)) / 2)}</Typography>
              <Typography variant="caption">{field.max || 100}</Typography>
            </Box>
          </Box>
        );

      case 'rating':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating
              name={`rating-${field.id}`}
              value={0}
              readOnly={!isPreview}
              precision={1}
              size="large"
              icon={<StarIcon fontSize="inherit" />}
              emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
            />
            <Typography variant="body2" sx={{ ml: 1 }}>
              0/5
            </Typography>
          </Box>
        );

      case 'file':
        return (
          <Box>
            <input 
              type="file" 
              disabled={!isPreview}
              style={{
                ...baseStyle,
                padding: '8px'
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Choose file to upload
            </Typography>
          </Box>
        );

      case 'image':
        return (
          <Box>
            <input 
              type="file" 
              accept="image/*" 
              disabled={!isPreview}
              style={{
                ...baseStyle,
                padding: '8px'
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Choose image file to upload
            </Typography>
          </Box>
        );

      case 'ranking':
        return (
          <Box>
            {field.options?.map((option, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
                <Typography sx={{ flex: 1 }}>{option}</Typography>
                <select 
                  disabled={!isPreview}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    minWidth: '60px'
                  }}
                >
                  <option value="">-</option>
                  {[...Array(field.options?.length || 0)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </Box>
            ))}
            <Typography variant="caption" color="text.secondary">
              Rank each option from 1 to {field.options?.length || 0}
            </Typography>
          </Box>
        );

      default:
        return (
          <input
            type="text"
            placeholder={field.placeholder || field.label}
            disabled={!isPreview}
            style={baseStyle}
          />
        );
    }
  };


  const handleImportJson = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonContent = e.target.result;
        const parsedConfig = JSON.parse(jsonContent);
        
        // Validate the structure
        if (!parsedConfig.pages || !Array.isArray(parsedConfig.pages)) {
          throw new Error('Invalid JSON structure: pages array is required');
        }

        // Validate each page
        parsedConfig.pages.forEach((page, index) => {
          if (!page.id) throw new Error(`Page ${index + 1}: id is required`);
          if (!page.title) throw new Error(`Page ${index + 1}: title is required`);
          if (!Array.isArray(page.fields)) throw new Error(`Page ${index + 1}: fields array is required`);
          
          // Validate each field
          page.fields.forEach((field, fieldIndex) => {
            if (!field.id) throw new Error(`Page ${index + 1}, Field ${fieldIndex + 1}: id is required`);
            if (!field.type) throw new Error(`Page ${index + 1}, Field ${fieldIndex + 1}: type is required`);
            if (!field.label) throw new Error(`Page ${index + 1}, Field ${fieldIndex + 1}: label is required`);
          });
        });

        setFormBuilderConfig(parsedConfig);
        console.log('FormBuilder: Successfully imported JSON config');
      } catch (error) {
        console.error('FormBuilder: Failed to import JSON:', error);
        alert(`Failed to import JSON: ${error.message}`);
      }
    };

    reader.readAsText(file);
    // Reset the input
    event.target.value = '';
  };

  const handleExportJson = () => {
    try {
      const jsonString = JSON.stringify(formBuilderConfig, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `form-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('FormBuilder: Failed to export JSON:', error);
    }
  };

   const sampleConfig = {
        formTitle: "Sample Form",
        pages: [
          {
            id: "sample_page_1",
            title: "Page 1",
            description: "Please provide your contact details",
            fields: [
              {
                id: "sample_name",
                type: "text",
                label: "Full Name",
                placeholder: "Enter your full name",
                required: true,
                hasCorrectAnswer: true,
                correctAnswer: "Pavithra"
              },
              {
                id: "sample_email",
                type: "text",
                label: "Email Address",
                placeholder: "Enter your email",
                required: true,
                hasCorrectAnswer: true,
                correctAnswer: "Pavithra@instrive.in"
              },
              {
                id: "sample_gender",
                type: "radio",
                label: "Gender",
                required: false,
                options: ["Male", "Female", "Other", "Prefer not to say"],
                hasCorrectAnswer: true,
                correctAnswer: "Female"
              },
              {
                id: "sample_interests",
                type: "checkbox",
                label: "Interests",
                required: false,
                options: ["Technology", "Sports", "Music", "Travel", "Reading"],
                hasCorrectAnswer: true,
                correctAnswer: ["Technology", "Sports"]
              },
              {
                id: "sample_country",
                type: "select",
                label: "Country",
                required: true,
                options: ["United States", "Canada", "United Kingdom", "Australia", "Other"],
                hasCorrectAnswer: true,
                correctAnswer: "United States"
              },
              {
                id: "sample_rating",
                type: "rating",
                label: "Rate your experience",
                required: false,
                hasCorrectAnswer: true,
                correctAnswer: "4"
              },
              {
                id: "sample_slider",
                type: "slider",
                label: "Age Range",
                required: false,
                min: 18,
                max: 80,
                hasCorrectAnswer: true,
                correctAnswer: "25"
              }
            ]
          }
        ]
      };


const handleGenerate = async () => {
  setLoading(true); 
  try {
    // Check if we have an existing form to modify
    const hasExistingForm = formBuilderConfig.pages && formBuilderConfig.pages.length > 0 && 
                           formBuilderConfig.pages.some(page => page.fields && page.fields.length > 0);
    
    let prompt;
    
    if (hasExistingForm) {
      // For existing forms, provide current config as context
      prompt = `You are a form builder assistant. I have an existing form configuration that I want to modify. 
      
CURRENT FORM CONFIGURATION:
${JSON.stringify(formBuilderConfig, null, 2)}

MODIFICATION REQUEST: ${generationPrompt}

Please return the MODIFIED form configuration as JSON. Keep all existing fields and pages unless specifically asked to remove them. Only add, modify, or remove fields as requested in the modification request. Use the same structure as the current configuration.

Return only the JSON response:`;
    } else {
      // For new forms, use the original approach
      prompt = `You are a form builder assistant. Based on a prompt, return a JSON form configuration.

Use the following structure and send response only the json:
${JSON.stringify(sampleConfig, null, 2)}

Prompt: ${generationPrompt}`;
    }

    const response = await axios.post('http://localhost:3000/api/claude', {
      prompt: prompt
    });

    console.log('Claude response:', response.data.content);
    const aiContent = response.data?.content || '{}';
    let generatedForm;

    try {
      // Try normal JSON.parse
      generatedForm = JSON.parse(aiContent);
    } catch {
      // Try to extract JSON inside triple backticks
      const match = aiContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (match) {
        try {
          generatedForm = JSON.parse(match[1]);
        } catch (jsonError) {
          console.error('Failed to parse JSON from inside code block:', jsonError);
          generatedForm = {};
        }
      } else {
        console.warn('No JSON code block found in AI response');
        generatedForm = {};
      }
    }

    // Validate the generated form has the required structure
    if (!generatedForm.pages || !Array.isArray(generatedForm.pages)) {
      throw new Error('Invalid form structure returned by AI');
    }

    setFormBuilderConfig(generatedForm);
    setGenerateDialogOpen(false);
    setGenerationPrompt('');
  } catch (error) {
    console.error('Claude API error:', error.response?.data || error.message);
    alert(`Failed to generate form: ${error.message || 'Unknown error'}`);
  } finally {
    setLoading(false);
  }
};




  const handleDownloadSample = () => {
    try {
     
      const jsonString = JSON.stringify(sampleConfig, null, 2);
      
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sample-form-config.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('FormBuilder: Failed to download sample:', error);
    }
  };

  const handleRemovePage = (pageIndex) => {
    const newPages = formBuilderConfig.pages.filter((page, idx) => idx !== pageIndex);
    
    // If no pages left, create a default page
    if (newPages.length === 0) {
      const defaultPage = {
        id: `page_${Date.now()}`,
        title: "New Page",
        description: "",
        fields: []
      };
      setFormBuilderConfig({ ...formBuilderConfig, pages: [defaultPage] });
    } else {
      setFormBuilderConfig({ ...formBuilderConfig, pages: newPages });
    }
    
    // Clear selected field if it was on the deleted page
    setSelectedField(null);
  };

  const handleRemoveField = (pageIndex, fieldIndex) => {
    const newPages = formBuilderConfig.pages.map((page, idx) => {
      if (idx !== pageIndex) return page;

      const newFields = page.fields.filter((field, idx) => idx !== fieldIndex);
      return { ...page, fields: newFields };
    });
    setFormBuilderConfig({ ...formBuilderConfig, pages: newPages });
    
    // Clear selected field if it was the deleted one
    const deletedField = formBuilderConfig.pages[pageIndex].fields[fieldIndex];
    if (selectedField?.id === deletedField?.id) {
      setSelectedField(null);
    }
  };

  const handleResetForm = () => {
    setResetDialogOpen(true);
  };

  const confirmReset = () => {
    // Reset to default config using context
    const defaultConfig = getDefaultFormConfig();
    setFormBuilderConfig(defaultConfig);
    setSelectedField(null);
    setResetDialogOpen(false);
    console.log('FormBuilder: Reset to default configuration');
  };

  const cancelReset = () => {
    setResetDialogOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="xl" sx={{ py: 1, flex: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h5" gutterBottom sx={{ flexGrow: 1 }}>
              Create New Form
            </Typography>

            <Button
  variant="outlined"
  onClick={() => setGenerateDialogOpen(true)}
  startIcon={<CodeIcon />}
  size="large"
  color="secondary"
>
  Generate Form
</Button>
            
            <Button
              variant="outlined"
              onClick={handleResetForm}
              startIcon={<RefreshIcon />}
              size="large"
              color="error"
            >
              Reset Form
            </Button>
            
            <input
              accept=".json"
              style={{ display: 'none' }}
              id="import-json-file"
              type="file"
              onChange={handleImportJson}
            />
            <label htmlFor="import-json-file">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadIcon />}
                size="large"
              >
                Import JSON
              </Button>
            </label>
            
            <Button
              variant="outlined"
              onClick={handleExportJson}
              startIcon={<DownloadIcon />}
              size="large"
              color="primary"
            >
              Export JSON
            </Button>
          </Stack>
        </Box>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Form Builder" />
            <Tab label="JSON Editor" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {activeTab === 0 && (
          <FormFieldsEditor
            formTitle={formBuilderConfig.formTitle}
            pages={formBuilderConfig.pages}
            setFormTitle={(newTitle) => setFormBuilderConfig(prev => ({ ...prev, formTitle: newTitle }))}
            setPages={(newPages) => setFormBuilderConfig({ ...formBuilderConfig, pages: newPages })}
            selectedField={selectedField}
            setSelectedField={setSelectedField}
            renderFormField={(field) => renderFormField(field, false)}
            fieldTypes={fieldTypes}
            onRemovePage={handleRemovePage}
            onRemoveField={handleRemoveField}
          />
        )}

        {activeTab === 1 && (
          <FormJsonEditor
            formConfig={formBuilderConfig}
            setFormConfig={setFormBuilderConfig}
            onImport={handleImportJson}
            onExport={handleExportJson}
          />
        )}

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
              Are you sure you want to reset? This will delete all your current form data and cannot be undone.
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

        {/* Generate Confirmation Dialog */}
        <Dialog
  open={generateDialogOpen}
  onClose={() => setGenerateDialogOpen(false)}
  aria-labelledby="generate-dialog-title"
  aria-describedby="generate-dialog-description"
  fullWidth
  maxWidth="sm"
>
  <DialogTitle id="generate-dialog-title">Generate Form with AI</DialogTitle>
  <DialogContent>
    <DialogContentText id="generate-dialog-description">
      Enter a prompt like "Generate school admission form" and we’ll generate a Form.
    </DialogContentText>
    <Box mt={2}>
      <textarea
        rows={4}
        value={generationPrompt}
        onChange={(e) => setGenerationPrompt(e.target.value)}
        placeholder="e.g., Generate school admission form"
        style={{
          width: '100%',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '10px',
          fontFamily: 'inherit',
          fontSize: '14px',
        }}
      />
    </Box>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setGenerateDialogOpen(false)} color="primary">
      Cancel
    </Button>
<Button
  variant="contained"
  onClick={handleGenerate}
  disabled={loading}
>
  {loading ? <CircularProgress size={24} /> : 'Generate Form'}
</Button>

  </DialogActions>
</Dialog>

      </Container>

      {/* Footer */}
      <Paper 
        elevation={3} 
        sx={{ 
          mt: 4, 
          p: 3, 
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #e0e0e0'
        }}
      >
        <Container maxWidth="xl">
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            alignItems="center"
            justifyContent="flex-end"
          >
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={handleDownloadSample}
                startIcon={<DownloadIcon />}
                size="medium"
                color="primary"
              >
                Download Sample
              </Button>
              
              <Button
                variant="contained"
                onClick={() => navigate('/preview')}
                startIcon={<VisibilityIcon />}
                size="medium"
                color="primary"
              >
                Preview
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Paper>
    </Box>
  );
};

export default FormBuilder;