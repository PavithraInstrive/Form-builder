// src/Components/FormBuilderLayout.jsx
import { Outlet } from 'react-router-dom';
import { FormProvider } from '../contexts/FormContexts';

const FormBuilderLayout = () => {
  return (
    <FormProvider>
      <Outlet />
    </FormProvider>
  );
};

export default FormBuilderLayout;
