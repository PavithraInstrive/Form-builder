import React from 'react';

const FieldPropertiesPanel = ({ selectedField, updateField }) => {
  if (!selectedField) return null;

  return (
    <div className="properties-panel">
      <h3>Field Properties</h3>

      <div className="property-group">
        <label>Label</label>
        <input
          type="text"
          value={selectedField.label}
          onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
        />
      </div>

      <div className="property-group">
        <label>Placeholder</label>
        <input
          type="text"
          value={selectedField.placeholder}
          onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
        />
      </div>

      <div className="property-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={selectedField.required}
            onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
          />
          Required
        </label>
      </div>

      {(selectedField.type === 'select' || selectedField.type === 'radio') && (
        <div className="property-group">
          <label>Options</label>
          {selectedField.options.map((option, idx) => (
            <div key={idx} className="option-row">
              <input
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...selectedField.options];
                  newOptions[idx] = e.target.value;
                  updateField(selectedField.id, { options: newOptions });
                }}
              />
              <button
                onClick={() => {
                  const newOptions = selectedField.options.filter((_, i) => i !== idx);
                  updateField(selectedField.id, { options: newOptions });
                }}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            className="add-option-btn"
            onClick={() => {
              const newOptions = [...selectedField.options, `Option ${selectedField.options.length + 1}`];
              updateField(selectedField.id, { options: newOptions });
            }}
          >
            + Add Option
          </button>
        </div>
      )}
    </div>
  );
};

export default FieldPropertiesPanel;