import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  IconButton,
  FormControlLabel,
  Checkbox,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Chip,
  Stack,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const FormFieldsEditor = ({
  pages,
  setPages,
  selectedField,
  setSelectedField,
  renderFormField,
  fieldTypes,
  onRemovePage, // Use the parent's remove page handler
  onRemoveField, // Use the parent's remove field handler
}) => {
  console.log('FormFieldsEditor pages:', pages);

  const handlePageChange = (pageIndex, key, value) => {
    console.log('Updating page:', pageIndex, key, value);
    const updatedPages = [...pages];
    updatedPages[pageIndex] = {
      ...updatedPages[pageIndex],
      [key]: value
    };
    setPages(updatedPages);
  };

  const handleFieldChange = (pageIndex, fieldId, key, value) => {
    const updatedPages = [...pages];
    updatedPages[pageIndex].fields = updatedPages[pageIndex].fields.map(field =>
      field.id === fieldId ? { ...field, [key]: value } : field
    );
    setPages(updatedPages);
  };

  const handleFieldTypeChange = (pageIndex, fieldId, newType) => {
    const defaultOptions = ['Option 1', 'Option 2', 'Option 3'];
    const updatedPages = [...pages];
    const fieldIndex = updatedPages[pageIndex].fields.findIndex(f => f.id === fieldId);
    if (fieldIndex !== -1) {
      updatedPages[pageIndex].fields[fieldIndex] = {
        ...updatedPages[pageIndex].fields[fieldIndex],
        type: newType,
        label: `${newType.charAt(0).toUpperCase() + newType.slice(1)} Field`,
        options: ['select', 'radio', 'checkbox'].includes(newType) ? defaultOptions : [],
      };
    }
    setPages(updatedPages);
  };

  const deleteField = (pageIndex, fieldId) => {
    const fieldIndex = pages[pageIndex].fields.findIndex(f => f.id === fieldId);
    if (fieldIndex !== -1 && onRemoveField) {
      onRemoveField(pageIndex, fieldIndex);
    }
  };

  const addField = (pageIndex, type) => {
    const newField = {
      id: `field_${Date.now()}`,
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      required: false,
      placeholder: '',
      options: ['select', 'radio', 'checkbox'].includes(type) ? ['Option 1', 'Option 2'] : [],
    };
    const updatedPages = [...pages];
    updatedPages[pageIndex].fields.push(newField);
    setPages(updatedPages);
  };

  const addPage = () => {
    const newPage = {
      id: `page_${Date.now()}`,
      title: `Page ${pages.length + 1}`,
      description: '',
      fields: [],
    };
    setPages([...pages, newPage]);
  };

  const deletePage = (pageIndex) => {
    if (onRemovePage) {
      onRemovePage(pageIndex);
    }
  };

  return (
    <Box>
      {pages.map((page, pageIndex) => (
        <Paper
          key={page.id}
          elevation={2}
          sx={{
            p: 3,
            mb: 4,
            border: '2px solid',
            borderColor: 'grey.300',
            backgroundColor: 'grey.50',
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <TextField
                variant="standard"
                value={page.title || ''}
                onChange={(e) => {
                  e.stopPropagation();
                  handlePageChange(pageIndex, 'title', e.target.value);
                }}
                onFocus={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                placeholder={`Page ${pageIndex + 1}`}
                autoComplete="off"
                sx={{
                  flex: 1,
                  '& .MuiInput-input': {
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    cursor: 'text',
                  },
                  '& .MuiInput-root': {
                    cursor: 'text',
                  }
                }}
                inputProps={{
                  style: {
                    fontSize: '1.5rem',
                    fontWeight: 600,
                  }
                }}
              />
              {/* Always show delete button for every page including "Page 1" */}
              <IconButton
                onClick={() => deletePage(pageIndex)}
                color="error"
                size="small"
                sx={{ ml: 2 }}
                title={`Delete "${page.title || `Page ${pageIndex + 1}`}"`}
              >
                <DeleteIcon />
              </IconButton>
            </Box>

            <TextField
              variant="standard"
              fullWidth
              multiline
              value={page.description || ''}
              onChange={(e) => {
                e.stopPropagation();
                handlePageChange(pageIndex, 'description', e.target.value);
              }}
              onFocus={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              placeholder="Page Description"
              sx={{
                '& .MuiInput-input': {
                  color: 'text.secondary',
                }
              }}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box>
            {page.fields.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography color="text.secondary" variant="body1">
                  No fields yet. Click the button below to add one.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {page.fields.map((field) => (
                  <Card
                    key={field.id}
                    onClick={() => setSelectedField(field)}
                    sx={{
                      cursor: 'pointer',
                      border: selectedField?.id === field.id ? '2px solid' : '1px solid',
                      borderColor: selectedField?.id === field.id ? 'primary.main' : 'grey.300',
                      backgroundColor: selectedField?.id === field.id ? 'primary.50' : 'background.paper',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'grey.400',
                        elevation: 3,
                      }
                    }}
                  >
                    <CardContent>
                      {/* Field Label Input */}
                      <TextField
                        fullWidth
                        size="small"
                        label="Field Label"
                        value={field.label}
                        onChange={(e) => handleFieldChange(pageIndex, field.id, 'label', e.target.value)}
                        sx={{ mb: 2 }}
                        onClick={(e) => e.stopPropagation()} // Prevent card selection when editing
                      />

                      {/* Rendered Field Preview */}
                      <Box sx={{ mb: 2, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                          Field Preview:
                        </Typography>
                        {renderFormField(field)}
                      </Box>

                      {/* Field Controls */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                          <InputLabel>Field Type</InputLabel>
                          <Select
                            value={field.type}
                            onChange={(e) => handleFieldTypeChange(pageIndex, field.id, e.target.value)}
                            label="Field Type"
                            onClick={(e) => e.stopPropagation()} // Prevent card selection when editing
                          >
                            {fieldTypes.map((f) => (
                              <MenuItem key={f.type} value={f.type}>
                                {f.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={field.required}
                              onChange={(e) =>
                                handleFieldChange(pageIndex, field.id, 'required', e.target.checked)
                              }
                              size="small"
                              onClick={(e) => e.stopPropagation()} // Prevent card selection when editing
                            />
                          }
                          label="Required"
                          onClick={(e) => e.stopPropagation()} // Prevent card selection when editing
                        />

                        <Box sx={{ flexGrow: 1 }} />

                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteField(pageIndex, field.id);
                          }}
                          title="Delete Field"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      {/* Answer Field for Validation */}
                      <Box sx={{ mt: 2 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Correct Answer"
                          value={field.correctAnswer || ''}
                          onChange={(e) => handleFieldChange(pageIndex, field.id, 'correctAnswer', e.target.value)}
                          placeholder={
                            field.type === 'checkbox' ? 'Enter comma-separated options (e.g., Option 1, Option 2)' :
                            field.type === 'radio' || field.type === 'select' ? 'Enter the correct option' :
                            'Enter the correct answer'
                          }
                          sx={{ mt: 1 }}
                          // helperText={
                          //   field.type === 'checkbox' ? 'For checkboxes, separate multiple answers with commas' :
                          //   field.type === 'radio' || field.type === 'select' ? 'Select from available options' :
                          //   'The exact answer to validate against'
                          // }
                          onClick={(e) => e.stopPropagation()} // Prevent card selection when editing
                        />
                      </Box>

                      {(['select', 'radio', 'checkbox'].includes(field.type)) && (
                        <Box sx={{ mt: 2 }} onClick={(e) => e.stopPropagation()}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Options:
                          </Typography>
                          <Stack spacing={1}>
                            {field.options?.map((option, optionIndex) => (
                              <Box key={optionIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TextField
                                  size="small"
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...field.options];
                                    newOptions[optionIndex] = e.target.value;
                                    handleFieldChange(pageIndex, field.id, 'options', newOptions);
                                  }}
                                  placeholder={`Option ${optionIndex + 1}`}
                                  sx={{ flexGrow: 1 }}
                                />
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    const newOptions = field.options.filter((_, i) => i !== optionIndex);
                                    handleFieldChange(pageIndex, field.id, 'options', newOptions);
                                  }}
                                  title="Delete Option"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            ))}
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
                                handleFieldChange(pageIndex, field.id, 'options', newOptions);
                              }}
                              startIcon={<AddIcon />}
                              sx={{ alignSelf: 'flex-start' }}
                            >
                              Add Option
                            </Button>
                          </Stack>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}

            {/* Add Field Button */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="contained"
                color="success"
                onClick={() => addField(pageIndex, 'text')}
                startIcon={<AddIcon />}
                size="large"
              >
                Add Field
              </Button>
            </Box>
          </Box>
        </Paper>
      ))}

      {/* Add Page Button */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button
          variant="contained"
          onClick={addPage}
          startIcon={<AddIcon />}
          size="large"
          sx={{ px: 4, py: 2 }}
        >
          Add Page
        </Button>
      </Box>
    </Box>
  );
};

export default FormFieldsEditor;