// FormContext.js
import React, { createContext, useContext, useState } from 'react';

const FormContext = createContext();

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};

export const FormProvider = ({ children }) => {
  const getDefaultFormConfig = () => ({
    formTitle: 'Form Title',
    pages: [
      {
        id: `page_${Date.now()}`,
        title: "Page 1",
        description: "",
        published: false,
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

  const [formBuilderConfig, setFormBuilderConfig] = useState(getDefaultFormConfig());
  const [userRole, setUserRole] = useState(null);
  const [formSubmissionResults, setFormSubmissionResults] = useState(null);

  const value = {
    formBuilderConfig,
    setFormBuilderConfig,
    userRole,
    setUserRole,
    formSubmissionResults,
    setFormSubmissionResults,
    getDefaultFormConfig,
  };

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
};