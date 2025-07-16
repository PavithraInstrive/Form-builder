// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import FormBuilderPage from "./Components/FormBuilder";
import FormPreviewPage from "./Components/FormPreview";
import FormResultsPage from "./Components/FormResults";
// import FormJsonEditorPage from "./Components/FormJsonEditorPage";
import Login from "./Components/Login";
import PrivateRoute from "./Components/PrivateRoute";
import Layout from "./Components/Layout";
import Dashboard from "./Components/Dashboard";
// import Forms from "./Components/Forms";
// import Analytics from "./Components/Analytics";
// import Settings from "./Components/Settings";
import { AuthProvider } from "./contexts/AuthContext";
import { FormProvider } from "./FormContext"; // Add this import
import "./App.css";
import LandingPage from "./Pages/LandingPage";
import SignUp from "./Pages/SignUp";
import FormListPage from "./Pages/FormListPage";
import EditForm from "./Components/EditForm";
import FormSubmissionsPage from "./Pages/FormSubmissionsPage";
import ViewSubmission from "./Components/ViewSubmission";
import FormPreviewReadonly from "./Components/preview";

const App = () => {
  return (
    <AuthProvider>
      <FormProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<LandingPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<Login />} />
            
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="forms" element={<FormListPage />} />
              <Route path="edit/:formId" element={<EditForm />} />
              {/* <Route path="forms" element={<Forms />} /> */}
              <Route path="form-builder" element={<FormBuilderPage />} />
              <Route path="preview" element={<FormPreviewPage />} />
              <Route path="results" element={<FormResultsPage />} />
              <Route path="/submissions" element={<FormSubmissionsPage />} />
              <Route path ="view-submission/:submissionId" element={<ViewSubmission/>} />
              <Route path="preview/:formId" element={<FormPreviewReadonly />} />
              {/* <Route path="import" element={<FormJsonEditorPage />} /> */}
              {/* <Route path="analytics" element={<Analytics />} /> */}
              {/* <Route path="settings" element={<Settings />} /> */}
            </Route>
          </Routes>
        </BrowserRouter>
      </FormProvider> 
    </AuthProvider>
  );
};

export default App;