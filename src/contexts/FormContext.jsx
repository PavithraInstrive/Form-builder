// src/FormContext.jsx
import React, { createContext, useContext, useState } from "react";

const FormContext = createContext();

const initialFormState = {
  formTitle: "",
  pages: [],
  // add other default fields as needed
};

export const FormProvider = ({ children }) => {
  const [formState, setFormState] = useState(initialFormState);

  const resetForm = () => setFormState(initialFormState);

  return (
    <FormContext.Provider value={{ formState, setFormState, resetForm }}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => useContext(FormContext);
