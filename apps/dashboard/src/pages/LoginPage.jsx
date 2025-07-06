// src/pages/LoginPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  TextField,
  Typography,
  Paper,
  Link,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Lock as LockIcon, Email as EmailIcon } from "@mui/icons-material";
import useAuthStore from "../store/authStore";
import { useShallow } from "zustand/react/shallow";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const { login, loading } = useAuthStore(
    useShallow((state) => ({
      login: state.login,
      loading: state.loading,
    }))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    const success = await login(email, password, rememberMe);
    console.log(success);
    if (success) {
      // Redirect based on role
      const redirectPath = "/";
      navigate(redirectPath, { replace: true });
    } else {
      setError("Invalid email or password");
    }
  };

  // Load remembered email if exists
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        minHeight: "100vh", // Make container take full viewport height
        display: "flex",
        alignItems: "center", // Center vertically
        justifyContent: "center", // Center horizontally
      }}
    >
      <Box
        sx={{
          width: "100%", // Ensure the Box takes full width of Container
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <EmailIcon sx={{ mr: 1, color: "action.active" }} />
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <LockIcon sx={{ mr: 1, color: "action.active" }} />
                ),
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  value="remember"
                  color="primary"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              }
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : "Sign In"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
