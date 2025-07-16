import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Chip,
  Stack,
  Card,
} from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';

const getBaseStyle = (hasError = false, disabled = false) => ({
  width: '100%',
  padding: '12px',
  border: hasError ? '2px solid #f44336' : '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '14px',
  backgroundColor: disabled ? '#f5f5f5' : 'white',
  cursor: disabled ? 'not-allowed' : 'text',
  color: disabled ? '#666' : '#333'
});

// Text Input Field
export const TextInputField = ({ 
  field, 
  value = '', 
  onChange = () => {}, 
  disabled = false, 
  hasError = false,
  placeholder = null 
}) => {
  return (
    <input
      type="text"
      id={field.id}
      value={value}
      onChange={(e) => !disabled && onChange(field.id, e.target.value)}
      placeholder={placeholder || field.placeholder || ''}
      disabled={disabled}
      required={field.required}
      style={getBaseStyle(hasError, disabled)}
    />
  );
};

// Textarea Field
export const TextareaField = ({ 
  field, 
  value = '', 
  onChange = () => {}, 
  disabled = false, 
  hasError = false,
  placeholder = null 
}) => {
  return (
    <textarea
      id={field.id}
      value={value}
      onChange={(e) => !disabled && onChange(field.id, e.target.value)}
      placeholder={placeholder || field.placeholder || ''}
      disabled={disabled}
      required={field.required}
      rows={4}
      style={{
        ...getBaseStyle(hasError, disabled),
        resize: 'vertical',
        fontFamily: 'inherit'
      }}
    />
  );
};

// Multi-text Field
export const MultiTextField = ({ 
  field, 
  value = [], 
  onChange = () => {}, 
  disabled = false, 
  hasError = false 
}) => {
  const count = field.textboxCount || 2;
  const answers = Array.isArray(value) ? value : Array(count).fill('');

  const handleMultiTextChange = (index, inputValue) => {
    if (disabled) return;
    const updated = [...answers];
    updated[index] = inputValue;
    onChange(field.id, updated);
  };

  return (
    <Stack spacing={1}>
      {Array.from({ length: count }).map((_, idx) => (
        <input
          key={idx}
          type="text"
          value={answers[idx] || ''}
          onChange={(e) => handleMultiTextChange(idx, e.target.value)}
          disabled={disabled}
          placeholder={disabled ? `${field.label} ${idx + 1}` : `Enter ${field.label} ${idx + 1}`}
          style={getBaseStyle(hasError, disabled)}
        />
      ))}
    </Stack>
  );
};

// Select Field
export const SelectField = ({ 
  field, 
  value = '', 
  onChange = () => {}, 
  disabled = false, 
  hasError = false 
}) => {
  return (
    <FormControl fullWidth size="small" error={hasError} disabled={disabled}>
      <InputLabel id={`select-label-${field.id}`}>
        {field.placeholder || 'Select an option'}
      </InputLabel>
      <Select
        labelId={`select-label-${field.id}`}
        id={field.id}
        value={value}
        label={field.placeholder || 'Select an option'}
        onChange={(e) => !disabled && onChange(field.id, e.target.value)}
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
};

// Multi-select Field
export const MultiSelectField = ({ 
  field, 
  value = [], 
  onChange = () => {}, 
  disabled = false, 
  hasError = false 
}) => {
  return (
    <FormControl fullWidth size="small" error={hasError} disabled={disabled}>
      <InputLabel id={`multi-select-label-${field.id}`}>
        {field.placeholder || 'Select options'}
      </InputLabel>
      <Select
        labelId={`multi-select-label-${field.id}`}
        id={field.id}
        multiple
        value={Array.isArray(value) ? value : []}
        onChange={(e) => !disabled && onChange(field.id, e.target.value, false, true)}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((val) => (
              <Chip key={val} label={val} size="small" />
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
};

// Radio Field
export const RadioField = ({ 
  field, 
  value = '', 
  onChange = () => {}, 
  disabled = false,
  viewMode = false 
}) => {
  return (
    <Box>
      {field.options?.map((option, idx) => (
        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {viewMode ? (
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: '2px solid #ddd',
                backgroundColor: value === option ? '#1976d2' : 'transparent',
                mr: 1
              }}
            />
          ) : (
            <input
              type="radio"
              name={field.id}
              value={option}
              checked={value === option}
              onChange={(e) => !disabled && onChange(field.id, e.target.value)}
              disabled={disabled}
              style={{ marginRight: '8px', cursor: disabled ? 'not-allowed' : 'pointer' }}
            />
          )}
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: value === option ? 'bold' : 'normal',
              color: value === option ? '#1976d2' : (disabled || viewMode) ? 'text.secondary' : 'text.primary'
            }}
          >
            {option}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// Checkbox Field
export const CheckboxField = ({ 
  field, 
  value = [], 
  onChange = () => {}, 
  disabled = false,
  viewMode = false 
}) => {
  const checkedOptions = Array.isArray(value) ? value : [];

  const handleCheckboxChange = (option) => {
    if (disabled) return;
    onChange(field.id, option, true);
  };

  return (
    <Box>
      {field.options?.map((option, idx) => (
        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {viewMode ? (
            <Box
              sx={{
                width: 16,
                height: 16,
                border: '2px solid #ddd',
                backgroundColor: checkedOptions.includes(option) ? '#1976d2' : 'transparent',
                mr: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {checkedOptions.includes(option) && (
                <Typography sx={{ color: 'white', fontSize: '12px' }}>✓</Typography>
              )}
            </Box>
          ) : (
            <input
              type="checkbox"
              name={`${field.id}_${idx}`}
              value={option}
              checked={checkedOptions.includes(option)}
              onChange={() => handleCheckboxChange(option)}
              disabled={disabled}
              style={{ marginRight: '8px', cursor: disabled ? 'not-allowed' : 'pointer' }}
            />
          )}
          <Typography 
            variant="body2"
            sx={{ 
              fontWeight: checkedOptions.includes(option) ? 'bold' : 'normal',
              color: checkedOptions.includes(option) ? '#1976d2' : (disabled || viewMode) ? 'text.secondary' : 'text.primary'
            }}
          >
            {option}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// Boolean Field
export const BooleanField = ({ 
  field, 
  value = '', 
  onChange = () => {}, 
  disabled = false,
  viewMode = false 
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {['yes', 'no'].map((option) => (
        <Box key={option} sx={{ display: 'flex', alignItems: 'center' }}>
          {viewMode ? (
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: '2px solid #ddd',
                backgroundColor: value === option ? '#1976d2' : 'transparent',
                mr: 1
              }}
            />
          ) : (
            <input 
              type="radio" 
              name={field.id} 
              value={option} 
              checked={value === option}
              onChange={(e) => !disabled && onChange(field.id, e.target.value)}
              disabled={disabled}
              style={{ marginRight: '8px', cursor: disabled ? 'not-allowed' : 'pointer' }}
            />
          )}
          <Typography 
            variant="body2"
            sx={{ 
              fontWeight: value === option ? 'bold' : 'normal',
              color: value === option ? '#1976d2' : (disabled || viewMode) ? 'text.secondary' : 'text.primary',
              textTransform: 'capitalize'
            }}
          >
            {option}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// Slider Field
export const SliderField = ({ 
  field, 
  value = 0, 
  onChange = () => {}, 
  disabled = false,
  viewMode = false 
}) => {
  const minValue = field.min || 0;
  const maxValue = field.max || 100;
  const currentValue = value || minValue;

  return (
    <Box sx={{ px: 1 }}>
      {viewMode ? (
        <Box sx={{ 
          width: '100%', 
          height: '6px', 
          backgroundColor: '#e0e0e0', 
          borderRadius: '3px',
          position: 'relative',
          mb: 2
        }}>
          <Box
            sx={{
              position: 'absolute',
              left: `${((currentValue - minValue) / (maxValue - minValue)) * 100}%`,
              top: '-5px',
              width: '16px',
              height: '16px',
              backgroundColor: '#1976d2',
              borderRadius: '50%',
              transform: 'translateX(-50%)'
            }}
          />
        </Box>
      ) : (
        <input
          type="range"
          id={field.id}
          min={minValue}
          max={maxValue}
          value={currentValue}
          onChange={(e) => !disabled && onChange(field.id, Number(e.target.value))}
          disabled={disabled}
          style={{ width: '100%', cursor: disabled ? 'not-allowed' : 'pointer' }}
        />
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Typography variant="caption" color="text.secondary">{minValue}</Typography>
        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
          {viewMode ? `Value: ${currentValue}` : currentValue}
        </Typography>
        <Typography variant="caption" color="text.secondary">{maxValue}</Typography>
      </Box>
    </Box>
  );
};

// Rating Field
export const RatingField = ({ 
  field, 
  value = 0, 
  onChange = () => {}, 
  disabled = false 
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Rating
        name={field.id}
        value={Number(value) || 0}
        onChange={(event, newValue) => {
          if (!disabled) onChange(field.id, newValue);
        }}
        disabled={disabled}
        readOnly={disabled}
        precision={1}
        size="large"
        icon={<StarIcon fontSize="inherit" />}
        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
      />
      <Typography variant="body2" sx={{ ml: 1 }}>
        {value || 0}/5
      </Typography>
    </Box>
  );
};

// File Field
export const FileField = ({ 
  field, 
  value = null, 
  onChange = () => {}, 
  disabled = false,
  viewMode = false 
}) => {
  const files = viewMode && Array.isArray(value) ? value : [];

  if (viewMode) {
    return (
      <Box>
        {files.length > 0 ? (
          <Stack spacing={1}>
            {files.map((file, idx) => (
              <Card key={idx} variant="outlined" sx={{ p: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(file.size / 1024).toFixed(1)} KB
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {file.type}
                </Typography>
              </Card>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            No files uploaded
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <input
        type="file"
        id={field.id}
        onChange={(e) => !disabled && onChange(field.id, e.target.files)}
        disabled={disabled}
        multiple={field.multiple}
        style={{
          width: '100%',
          padding: '8px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: disabled ? '#f5f5f5' : 'white',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      />
      {value && value.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {value.length} file(s) selected
        </Typography>
      )}
    </Box>
  );
};

// Image Field
export const ImageField = ({ 
  field, 
  value = null, 
  onChange = () => {}, 
  disabled = false,
  viewMode = false 
}) => {
  return (
    <FileField 
      field={{ ...field, accept: 'image/*' }}
      value={value}
      onChange={onChange}
      disabled={disabled}
      viewMode={viewMode}
    />
  );
};

// Ranking Field
export const RankingField = ({ 
  field, 
  value = {}, 
  onChange = () => {}, 
  disabled = false,
  viewMode = false 
}) => {
  const rankings = value || {};

  const handleRankingChange = (option, rank) => {
    if (disabled) return;
    const newRankings = { ...rankings, [option]: rank };
    onChange(field.id, newRankings);
  };

  return (
    <Box>
      {field.options?.map((option, idx) => (
        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
          <Typography sx={{ flex: 1 }} color={disabled || viewMode ? 'text.secondary' : 'text.primary'}>
            {option}
          </Typography>
          {viewMode ? (
            <Chip 
              label={rankings[option] ? `Rank: ${rankings[option]}` : 'Not ranked'}
              size="small"
              color={rankings[option] ? 'primary' : 'default'}
              variant="outlined"
            />
          ) : (
            <FormControl size="small" sx={{ minWidth: 80 }} disabled={disabled}>
              <Select
                value={rankings[option] || ''}
                onChange={(e) => handleRankingChange(option, e.target.value)}
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
          )}
        </Box>
      ))}
      {!viewMode && (
        <Typography variant="caption" color="text.secondary">
          Rank options from 1 to {field.options?.length || 0}
        </Typography>
      )}
    </Box>
  );
};

// Main Field Renderer Function
export const renderFormField = (field, value, onChange, options = {}) => {
  const {
    disabled = false,
    hasError = false,
    viewMode = false,
    placeholder = null
  } = options;

  const fieldProps = {
    field,
    value,
    onChange,
    disabled,
    hasError,
    viewMode,
    placeholder
  };

  switch (field.type) {
    case 'text':
      return <TextInputField {...fieldProps} />;
    case 'textarea':
      return <TextareaField {...fieldProps} />;
    case 'multi-text':
      return <MultiTextField {...fieldProps} />;
    case 'select':
      return <SelectField {...fieldProps} />;
    case 'multi-select':
      return <MultiSelectField {...fieldProps} />;
    case 'radio':
      return <RadioField {...fieldProps} />;
    case 'checkbox':
      return <CheckboxField {...fieldProps} />;
    case 'boolean':
      return <BooleanField {...fieldProps} />;
    case 'slider':
      return <SliderField {...fieldProps} />;
    case 'rating':
      return <RatingField {...fieldProps} />;
    case 'file':
      return <FileField {...fieldProps} />;
    case 'image':
      return <ImageField {...fieldProps} />;
    case 'ranking':
      return <RankingField {...fieldProps} />;
    default:
      return <TextInputField {...fieldProps} placeholder="Unknown field type" />;
  }
};

export default {
  TextInputField,
  TextareaField,
  MultiTextField,
  SelectField,
  MultiSelectField,
  RadioField,
  CheckboxField,
  BooleanField,
  SliderField,
  RatingField,
  FileField,
  ImageField,
  RankingField,
  renderFormField
};