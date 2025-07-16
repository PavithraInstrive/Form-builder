import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  TextField,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  InputAdornment,
  IconButton,
  Divider,
  Grid,
  Card,
  CardContent,
  Snackbar,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  ContentCopy as CopyIcon,
  FormatIndentIncrease as FormatIcon,
  Code as CodeIcon,
  Description as FileIcon,
} from '@mui/icons-material';

const FormJsonEditor = ({ formConfig, setFormConfig }) => {
  const [jsonString, setJsonString] = useState('');
  const [error, setError] = useState('');

  // Update JSON string when formConfig changes
  useEffect(() => {
    if (formConfig) {
      setJsonString(JSON.stringify(formConfig, null, 2));
    }
  }, [formConfig]);

  const handleJsonChange = (e) => {
    setJsonString(e.target.value);
    setError('');
  };

  const validateAndApplyJson = () => {
    try {
      const parsedConfig = JSON.parse(jsonString);
      
      // Basic validation
      if (!parsedConfig.pages || !Array.isArray(parsedConfig.pages)) {
        throw new Error('Invalid format: pages array is required');
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
      
      setFormConfig(parsedConfig);
      setError('');
      alert('JSON applied successfully!');

    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
    }
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonContent = e.target.result;
        const parsedConfig = JSON.parse(jsonContent);
        
        if (!parsedConfig.pages || !Array.isArray(parsedConfig.pages)) {
          throw new Error('Invalid JSON structure: pages array is required');
        }

        setJsonString(jsonContent);
        setFormConfig(parsedConfig);
        setError('');
        

      } catch (error) {
        setError(`Import failed: ${error.message}`);
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonString);
      setJsonString(JSON.stringify(parsed, null, 2));
      setError('');
    } catch (err) {
      setError('Cannot format invalid JSON');
    }
  };



  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          JSON Configuration Editor
        </Typography>
        <Stack direction="row" spacing={1}>
          <input
            accept=".json"
            style={{ display: 'none' }}
            id="json-file-input"
            type="file"
            onChange={handleFileImport}
          />
          <Button
            variant="outlined"
            onClick={formatJson}
            // startIcon={<FormatIcon />}
            size="small"
          >
            Format
          </Button>
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* JSON Editor */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Box sx={{ p: 2, backgroundColor: 'grey.50', borderBottom: '1px solid', borderColor: 'grey.200' }}>
          <Typography variant="subtitle2" color="text.secondary">
            Edit your form configuration JSON below:
          </Typography>
        </Box>
        
        <Box sx={{ position: 'relative' }}>
          <TextField
            fullWidth
            multiline
            rows={20}
            value={jsonString}
            onChange={handleJsonChange}
            placeholder="Edit your form configuration JSON here..."
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                '& fieldset': {
                  border: 'none',
                },
              },
              '& .MuiInputBase-input': {
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                fontSize: '14px',
                lineHeight: 1.5,
                padding: '16px',
              }
            }}
          />
        </Box>
      </Paper>

      {/* Control Buttons */}
      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mb: 3 }}>
       
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            onClick={validateAndApplyJson}
            color="primary"
            size="large"
          >
            Apply Changes
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default FormJsonEditor;