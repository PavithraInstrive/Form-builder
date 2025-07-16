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
  Alert,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const FormFieldsEditor = ({
  formTitle,
  pages,
  setFormTitle,
  setPages,
  selectedField,
  setSelectedField,
  renderFormField,
  fieldTypes,
  onRemovePage, 
  onRemoveField,
}) => {

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
      // Field types that can have correct answers by default
      const answerableTypes = ['select', 'radio', 'checkbox', 'multi-select', 'ranking', 'boolean', 'text', 'textarea', 'slider', 'rating'];
      const hasAnswerByDefault = answerableTypes.includes(newType);
      const field = updatedPages[pageIndex].fields[fieldIndex];

      // Reset field with type-specific properties
      const updatedField = {
        ...field,
        type: newType,
        label: `${newType.charAt(0).toUpperCase() + newType.slice(1)} Field`,
        hasCorrectAnswer: hasAnswerByDefault,
        correctAnswer: hasAnswerByDefault ? (field.correctAnswer || '') : '',
      };

      // Add type-specific properties
      switch (newType) {
        case 'select':
        case 'radio':
        case 'checkbox':
        case 'multi-select':
        case 'ranking':
          updatedField.options = field.options || defaultOptions;
          break;
        case 'boolean':
          updatedField.options = ['Yes', 'No'];
          break;
        case 'multi-text':
          updatedField.textboxCount = field.textboxCount || 2;
          updatedField.options = [];
          break;
        case 'slider':
          updatedField.min = field.min !== undefined ? field.min : 0;
          updatedField.max = field.max !== undefined ? field.max : 100;
          updatedField.options = [];
          break;
        case 'file':
        case 'image':
          updatedField.multiple = field.multiple || false;
          updatedField.options = [];
          break;
        default:
          updatedField.options = [];
          break;
      }

      updatedPages[pageIndex].fields[fieldIndex] = updatedField;
    }

    setPages(updatedPages);
  };

  const deleteField = (pageIndex, fieldId) => {
    const fieldIndex = pages[pageIndex].fields.findIndex(f => f.id === fieldId);
    if (fieldIndex !== -1 && onRemoveField) {
      onRemoveField(pageIndex, fieldIndex);
    }
  };

  const addField = (pageIndex, type = 'text') => {
    const answerableTypes = ['select', 'radio', 'checkbox', 'multi-select', 'ranking', 'boolean', 'text', 'textarea', 'slider', 'rating'];
    const hasAnswerByDefault = answerableTypes.includes(type);

    const newField = {
      id: `field_${Date.now()}`,
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      required: false,
      placeholder: '',
      hasCorrectAnswer: hasAnswerByDefault,
      correctAnswer: '',
    };

    // Add type-specific properties
    switch (type) {
      case 'select':
      case 'radio':
      case 'checkbox':
      case 'multi-select':
      case 'ranking':
        newField.options = ['Option 1', 'Option 2'];
        break;
      case 'boolean':
        newField.options = ['Yes', 'No'];
        break;
      case 'multi-text':
        newField.textboxCount = 2;
        break;
      case 'slider':
        newField.min = 0;
        newField.max = 100;
        break;
      case 'file':
      case 'image':
        newField.multiple = false;
        break;
    }

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

  const handleAnswerFlagChange = (pageIndex, fieldId, hasAnswer) => {
    const updatedPages = [...pages];
    updatedPages[pageIndex].fields = updatedPages[pageIndex].fields.map(field =>
      field.id === fieldId ? { 
        ...field, 
        hasCorrectAnswer: hasAnswer,
        correctAnswer: hasAnswer ? field.correctAnswer : ''
      } : field
    );
    setPages(updatedPages);
  };

  const getCorrectAnswerPlaceholder = (field) => {
    switch (field.type) {
      case 'checkbox':
      case 'multi-select':
        return 'Enter comma-separated options (e.g., Option 1, Option 2)';
      case 'radio':
      case 'select':
        return 'Enter the correct option';
      case 'boolean':
        return 'Enter "Yes" or "No"';
      case 'slider':
        return `Enter a number between ${field.min || 0} and ${field.max || 100}`;
      case 'rating':
        return 'Enter a number between 1 and 5';
      case 'ranking':
        return 'Enter JSON object with option rankings (e.g., {"Option 1": 1, "Option 2": 2})';
      default:
        return 'Enter the correct answer';
    }
  };

  const getCorrectAnswerHelperText = (field) => {
    switch (field.type) {
      case 'checkbox':
      case 'multi-select':
        return 'For multiple selections, separate answers with commas';
      case 'radio':
      case 'select':
        return 'Must match one of the available options exactly';
      case 'boolean':
        return 'Enter either "Yes" or "No"';
      case 'slider':
        return 'Enter the target value on the slider';
      case 'rating':
        return 'Enter the target star rating (1-5)';
      case 'ranking':
        return 'Enter rankings as JSON object where keys are options and values are ranks';
      default:
        return 'The exact answer to validate against';
    }
  };

  return (
    <Box>
      <Box marginBottom={3}>
        <TextField
          fullWidth
          variant="standard"
          label="Form Title"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          sx={{
            '& .MuiInput-input': {
              fontSize: '1.5rem',
              fontWeight: 400,
            },
          }}
        />
      </Box>
      
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
                    fontWeight: 200,
                    cursor: 'text',
                  },
                  '& .MuiInput-root': {
                    cursor: 'text',
                  }
                }}
                inputProps={{
                  style: {
                    fontSize: '1.5rem',
                    fontWeight: 200,
                  }
                }}
              />
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
                        onClick={(e) => e.stopPropagation()}
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
                            onClick={(e) => e.stopPropagation()}
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
                              onClick={(e) => e.stopPropagation()}
                            />
                          }
                          label="Required"
                          onClick={(e) => e.stopPropagation()}
                        />

                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={field.hasCorrectAnswer || false}
                              onChange={(e) =>
                                handleAnswerFlagChange(pageIndex, field.id, e.target.checked)
                              }
                              size="small"
                              onClick={(e) => e.stopPropagation()}
                            />
                          }
                          label="Has Answer"
                          onClick={(e) => e.stopPropagation()}
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

                      {/* Placeholder field for text-based inputs */}
                      {['text', 'textarea'].includes(field.type) && (
                        <Box sx={{ mt: 2 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Placeholder Text"
                            value={field.placeholder || ''}
                            onChange={(e) => handleFieldChange(pageIndex, field.id, 'placeholder', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Box>
                      )}

                      {/* File upload options */}
                      {['file', 'image'].includes(field.type) && (
                        <Box sx={{ mt: 2 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={field.multiple || false}
                                onChange={(e) =>
                                  handleFieldChange(pageIndex, field.id, 'multiple', e.target.checked)
                                }
                                size="small"
                                onClick={(e) => e.stopPropagation()}
                              />
                            }
                            label="Allow Multiple Files"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Box>
                      )}

                      {/* Answer Field for Validation */}
                      {field.hasCorrectAnswer && (
                        <Box sx={{ mt: 2 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Correct Answer"
                            value={field.correctAnswer || ''}
                            onChange={(e) => handleFieldChange(pageIndex, field.id, 'correctAnswer', e.target.value)}
                            placeholder={getCorrectAnswerPlaceholder(field)}
                            helperText={getCorrectAnswerHelperText(field)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Box>
                      )}

                      {/* Slider specific controls */}
                      {field.type === 'slider' && (
                        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                          <TextField
                            label="Min"
                            type="number"
                            size="small"
                            value={field.min !== undefined ? field.min : 0}
                            onChange={(e) => handleFieldChange(pageIndex, field.id, 'min', Number(e.target.value))}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <TextField
                            label="Max"
                            type="number"
                            size="small"
                            value={field.max !== undefined ? field.max : 100}
                            onChange={(e) => handleFieldChange(pageIndex, field.id, 'max', Number(e.target.value))}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Stack>
                      )}

                      {/* Multi-text specific controls */}
                      {field.type === 'multi-text' && (
                        <Box sx={{ mt: 2 }}>
                          <TextField
                            label="Number of Textboxes"
                            type="number"
                            size="small"
                            value={field.textboxCount || 2}
                            onChange={(e) => handleFieldChange(pageIndex, field.id, 'textboxCount', Math.max(1, Number(e.target.value)))}
                            inputProps={{ min: 1 }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Box>
                      )}

                      {/* Options for select, radio, checkbox, etc. */}
                      {(['select', 'radio', 'checkbox', 'multi-select', 'ranking'].includes(field.type)) && (
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

                      {/* Special note for ranking fields */}
                      {field.type === 'ranking' && field.hasCorrectAnswer && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          <Typography variant="caption">
                            For ranking fields, the correct answer should be a JSON object like:
                            <br />
                            <code>{`{"Option 1": 1, "Option 2": 2, "Option 3": 3}`}</code>
                          </Typography>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}

            {/* Add Field Button */}
            <Box sx={{ textAlign: 'end', mt: 3 }}>
              <Button
                variant="contained"
                color="success"
                onClick={() => addField(pageIndex, 'text')}
                startIcon={<AddIcon />}
                size="medium"
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