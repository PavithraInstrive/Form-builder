// src/pages/SignUp.jsx
import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Alert,
} from "@mui/material";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, getDoc } from "firebase/firestore";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const navigate = useNavigate();

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  // Handle email change with real-time validation
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    if (emailTouched) {
      setEmailError(validateEmail(newEmail));
    }
  };

  // Handle email blur (when user leaves the field)
  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  };

  const ensureUserProfile = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        name: name,
        role: "user",
      });
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate all fields before submission
    const emailValidationError = validateEmail(email);
    setEmailError(emailValidationError);
    setEmailTouched(true);
    
    if (emailValidationError) {
      setError("Invalid email format");
      return;
    }

    // Check for empty required fields
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await ensureUserProfile(user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Sign Up
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <form onSubmit={handleSignUp}>
        <TextField
          required
          fullWidth
          label="Name"
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          required
          fullWidth
          label="Email"
          type="email"
          margin="normal"
          value={email}
          onChange={handleEmailChange}
          onBlur={handleEmailBlur}
          error={!!emailError}
          helperText={emailError}
          autoComplete="email"
        />
        <TextField
          required
          fullWidth
          label="Password"
          type="password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <Button 
          fullWidth 
          type="submit" 
          variant="contained" 
          sx={{ mt: 2 }}
          disabled={!!emailError && emailTouched}
        >
          Sign Up
        </Button>
      </form>
    </Container>
  );
};

export default SignUp;