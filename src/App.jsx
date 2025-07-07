import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FormBuilder from "./Components/FormBuilder";
import FormPreview from './Components/FormPreview';
import FormResults from './Components/FormResults';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FormBuilder />} />
        <Route path="/preview" element={<FormPreview />} />
        <Route path="/results" element={<FormResults />} />  
    </Routes>
    </BrowserRouter>
  );
};

export default App;