// src/pages/LandingPage.jsx
import React from "react";
import { Button, Container, Typography, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ mt: 10, textAlign: "center" }}>
      <Typography variant="h3" gutterBottom>
        Welcome to QuickForm 🚀
      </Typography>
      <Typography variant="h6" sx={{ mb: 4 }}>
        Create, preview, and manage dynamic forms effortlessly.
      </Typography>
      <Stack spacing={2} direction="row" justifyContent="center">
        <Button variant="contained" onClick={() => navigate("/signup")}>
          Sign Up
        </Button>
        <Button variant="outlined" onClick={() => navigate("/signin")}>
          Sign In
        </Button>
      </Stack>
    </Container>
  );
};

export default LandingPage;
