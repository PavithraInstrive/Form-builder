import React, { useState } from 'react';
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
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';

const FormJsonEditor = ({ formConfig, setFormConfig }) => {
  const [jsonString, setJsonString] = useState(() => JSON.stringify(formConfig, null, 2));
  const [error, setError] = useState('');

  const handleJsonChange = (e) => {
    setJsonString(e.target.value);
    setError('');
  };

  const handleApplyJson = () => {
    try {
      const parsedConfig = JSON.parse(jsonString);
      setFormConfig(parsedConfig);
      setError('');
      
      setTimeout(() => {
        alert('JSON configuration applied successfully!');
      }, 100);
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        multiline
        rows={20}
        value={jsonString}
        onChange={handleJsonChange}
        placeholder="Edit your form configuration JSON here..."
        variant="outlined"
        sx={{
          mb: 3,
          '& .MuiInputBase-input': {
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            fontSize: '14px',
            lineHeight: 1.5,
          }
        }}
      />

      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Stack direction="row" spacing={1}>
 
          <Button
            variant="contained"
            onClick={handleApplyJson}
            color="primary"
          >
            Apply Changes
          </Button>
        
        </Stack>
      </Stack>

     
    </Paper>
  );
};

export default FormJsonEditor;