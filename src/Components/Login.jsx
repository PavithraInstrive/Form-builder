import React, { useState } from "react";
import { doc, getDoc } from 'firebase/firestore';
import { auth,db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const Navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    console.log(user);
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      console.log(userData);
      
      const role = userData.role;
      localStorage.setItem("userRole", role);        
     localStorage.setItem("userDetails", JSON.stringify(userData));


      if (role === "admin") {
        Navigate("/dashboard");
      } else {
        Navigate("/dashboard");
      }
    } else {
      throw new Error("No role info found for this user");
    }

  } catch (err) {
    console.error(err);
    setError(err.message);
  }
};

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
        <Typography variant="h5" gutterBottom align="center">
          Login
        </Typography>
        <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 2 }}>
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            variant="outlined"
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            fullWidth
            margin="normal"
            variant="outlined"
            type="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            size="large"
          >
            Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
