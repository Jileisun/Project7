// src/components/LoginRegister.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  Paper,
  Alert,
} from "@mui/material";
import axios from "../../axiosConfig";
import "./styles.css";

/**
 * LoginRegister Component
 * 
 * Provides a form for users to log in and register.
 * Supports password fields with confirmation for registration.
 */
function LoginRegister({ onLoginSuccess }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState(""); // Added password field for login
  const [registerData, setRegisterData] = useState({
    login_name: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    location: "",
    description: "",
    occupation: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  /**
   * Handles user login by sending login credentials to the server.
   */
  const handleLogin = async () => {
    setError("");
    setSuccess("");
    try {
      const response = await axios.post("/admin/login", {
        login_name: loginName,
        password: loginPassword, // Send password
      });

      const loggedInUser = response.data;
      onLoginSuccess(); // Notify PhotoShare to fetch user list
      navigate(`/users/${loggedInUser._id}`);
    } catch (err) { 
      console.error(
        "Login failed:",
        err.response ? err.response.data : err.message
      );
      setError(
        err.response ? err.response.data : "Login failed. Please try again."
      );
    }
  };

  /**
   * Handles user registration by sending registration data to the server.
   */
  const handleRegister = async () => {
    setError("");
    setSuccess("");

    // Validate that passwords match
    if (registerData.password !== registerData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    // Validate required fields
    if (
      !registerData.login_name ||
      !registerData.first_name ||
      !registerData.last_name ||
      !registerData.password
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const response = await axios.post("/user", {
        login_name: registerData.login_name,
        password: registerData.password,
        first_name: registerData.first_name,
        last_name: registerData.last_name,
        location: registerData.location,
        description: registerData.description,
        occupation: registerData.occupation,
      });

      // Use 'response' variable
      console.log("Registration successful:", response.data);

      setSuccess("Registration successful! You can now log in.");
      // Clear registration fields
      setRegisterData({
        login_name: "",
        password: "",
        confirm_password: "",
        first_name: "",
        last_name: "",
        location: "",
        description: "",
        occupation: "",
      });
      setIsLoginView(true); // Switch to login view
    } catch (err) { 
      console.error(
        "Registration failed:",
        err.response ? err.response.data : err.message
      );
      setError(
        err.response
          ? err.response.data
          : "Registration failed. Please try again."
      );
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "50px" }}>
      <Paper elevation={3} style={{ padding: "30px" }}>
        <Grid container spacing={3} direction="column">
          {/* Toggle Button */}
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => setIsLoginView(!isLoginView)}
            >
              {isLoginView ? "Switch to Register" : "Switch to Login"}
            </Button>
          </Grid>

          {/* Error Message */}
          {error && (
            <Grid item>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          {/* Success Message */}
          {success && (
            <Grid item>
              <Alert severity="success">{success}</Alert>
            </Grid>
          )}

          {/* Login View */}
          {isLoginView ? (
            <>
              <Grid item>
                <Typography variant="h4">Login</Typography>
              </Grid>
              <Grid item>
                <TextField
                  label="Login Name"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleLogin}
                  fullWidth
                >
                  Login
                </Button>
              </Grid>
            </>
          ) : (
            /* Registration View */
            <>
              <Grid item>
                <Typography variant="h4">Register</Typography>
              </Grid>
              <Grid item>
                <TextField
                  label="Login Name"
                  name="login_name"
                  value={registerData.login_name}
                  onChange={(e) => setRegisterData({
                      ...registerData,
                      login_name: e.target.value,
                    })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({
                      ...registerData,
                      password: e.target.value,
                    })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Confirm Password"
                  name="confirm_password"
                  type="password"
                  value={registerData.confirm_password}
                  onChange={(e) => setRegisterData({
                      ...registerData,
                      confirm_password: e.target.value,
                    })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item>
                <TextField
                  label="First Name"
                  name="first_name"
                  value={registerData.first_name}
                  onChange={(e) => setRegisterData({
                      ...registerData,
                      first_name: e.target.value,
                    })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Last Name"
                  name="last_name"
                  value={registerData.last_name}
                  onChange={(e) => setRegisterData({
                      ...registerData,
                      last_name: e.target.value,
                    })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Location"
                  name="location"
                  value={registerData.location}
                  onChange={(e) => setRegisterData({
                      ...registerData,
                      location: e.target.value,
                    })}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Description"
                  name="description"
                  value={registerData.description}
                  onChange={(e) => setRegisterData({
                      ...registerData,
                      description: e.target.value,
                    })}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Occupation"
                  name="occupation"
                  value={registerData.occupation}
                  onChange={(e) => setRegisterData({
                      ...registerData,
                      occupation: e.target.value,
                    })}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleRegister}
                  fullWidth
                >
                  Register Me
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
    </Container>
  );
}

export default LoginRegister;
