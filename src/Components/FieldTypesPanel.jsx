import React from 'react';

const FieldTypesPanel = ({ fieldTypes, addField }) => (
  <div className="sidebar">
    <h3>Field Types</h3>
    <div className="field-types">
      {fieldTypes.map(fieldType => (
        <div
          key={fieldType.type}
          className="field-type"
          onClick={() => addField(fieldType.type)}
        >
          <span className="field-icon">{fieldType.icon}</span>
          <span className="field-label">{fieldType.label}</span>
        </div>
      ))}
    </div>
  </div>
);

export default FieldTypesPanel;