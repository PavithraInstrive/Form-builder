import React from 'react';
import ReactDOM from 'react-dom';
import BasicTextFields from './inputFeilds';
import { CssBaseline, Container, Box } from '@mui/material';

function FormBuilder() {
  return (
    //    <React.Fragment>
    //   <CssBaseline />
      <Container fixed>
        <Box sx={{ bgcolor: '#cfe8fc',py: 8}} >
              <BasicTextFields/>
        </Box>

      </Container>
    // </React.Fragment>
    
  );
}

export default FormBuilder;


