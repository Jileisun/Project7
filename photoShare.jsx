// src/PhotoShare.js

import { Grid, Paper } from "@mui/material";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import axios from "./axiosConfig"; // Use the centralized Axios instance

import LoginRegister from "./components/LoginRegister";
import SinglePhotoView from "./components/SinglePhotoView";
import TopBar from "./components/TopBar";
import UserComments from "./components/UserComments";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import ProtectedRoute from "./components/ProtectedRoute"; // Import the ProtectedRoute
import "./styles/main.css";

/**
 * PhotoShare Component
 *
 * The main component of the PhotoShare application.
 * It handles routing, user authentication state, and layout.
 */
function PhotoShare() {
  const navigate = useNavigate(); // Initialize navigate

  // State variables
  const [advancedFeaturesEnabled, setAdvancedFeaturesEnabled] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  /**
   * checkLoginStatus
   *
   * Checks the current login status by querying the server.
   * Updates the isLoggedIn and loggedInUser state accordingly.
   */
  const checkLoginStatus = async () => {
    try {
      const response = await axios.get("/admin/checkSession");
      setIsLoggedIn(true);
      setLoggedInUser(response.data); // Assuming the response contains user data
      return response.data; // Return user data
    } catch {
      setIsLoggedIn(false);
      setLoggedInUser(null);
      return null;
    }
  };

  /**
   * useEffect Hook
   *
   * Runs once on component mount to:
   * - Retrieve the advancedFeaturesEnabled state from localStorage.
   * - Check the user's login status.
   */
  useEffect(() => {
    const storedAdvancedState = JSON.parse(localStorage.getItem("advancedFeaturesEnabled")) || false;
    setAdvancedFeaturesEnabled(storedAdvancedState);
    checkLoginStatus();
  }, []);

  /**
   * handleLoginChange
   *
   * Updates the isLoggedIn state based on login status changes.
   *
   * @param {boolean} newStatus - The new login status.
   */
  const handleLoginChange = (newStatus) => {
    setIsLoggedIn(newStatus);
  };

  /**
   * handleToggleAdvancedFeatures
   *
   * Toggles the advanced features and stores the state in localStorage.
   *
   * @param {boolean} isEnabled - Indicates if advanced features are enabled.
   */
  const handleToggleAdvancedFeatures = (isEnabled) => {
    setAdvancedFeaturesEnabled(isEnabled);
    localStorage.setItem("advancedFeaturesEnabled", JSON.stringify(isEnabled));
  };

  /**
   * fetchUsers
   *
   * Fetches the list of users from the server.
   * Only called if the user is logged in.
   */
  const fetchUsers = async () => {
    try {
      const response = await axios.get("/user/list");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching user list:", error);
    }
  };

  /**
   * handleLoginSuccess
   *
   * Called when the user successfully logs in.
   * It fetches the user list and updates the login status.
   */
  const handleLoginSuccess = async () => {
    await fetchUsers();
    const userData = await checkLoginStatus(); // Update login status and fetch user info after successful login

    // Navigate to the user detail page
    if (userData) {
      navigate(`/users/${userData._id}`);
    }
  };

  /**
   * useEffect Hook
   *
   * Fetches the user list whenever the login status changes.
   * Clears the user list if the user logs out.
   */
  useEffect(() => {
    if (isLoggedIn) {
      fetchUsers();
    } else {
      setUsers([]); // Clear the user list if not logged in
    }
  }, [isLoggedIn]);

  return (
    <div>
      <Grid container spacing={2}>
        {/* TopBar Section */}
        <Grid item xs={12}>
          <TopBar
            onToggleAdvancedFeatures={handleToggleAdvancedFeatures}
            advancedFeaturesEnabled={advancedFeaturesEnabled}
            onLoginChange={handleLoginChange}
          />
        </Grid>
        <div className="main-topbar-buffer" />

        {/* User List Section */}
        <Grid item sm={3}>
          <Paper className="main-grid-item">
            {isLoggedIn ? (
              <UserList users={users} advancedFeaturesEnabled={advancedFeaturesEnabled} />
            ) : (
              <div>Please log in to see the user list.</div>
            )}
          </Paper>
        </Grid>

        {/* Main Content Section */}
        <Grid item sm={9}>
          <Paper className="main-grid-item">
            <Routes>
              {/* Redirect root to /users if logged in, else to /login-register */}
              <Route
                path="/"
                element={<Navigate to={isLoggedIn ? "/users" : "/login-register"} replace />}
              />

              {/* Login/Register Route */}
              <Route
                path="/login-register"
                element={
                  isLoggedIn && loggedInUser ? (
                    <Navigate to={`/users/${loggedInUser._id}`} replace />
                  ) : (
                    <LoginRegister onLoginSuccess={handleLoginSuccess} />
                  )
                }
              />

              {/* Protected Routes */}
              <Route
                path="/users/:userId"
                element={(
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <UserDetail />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/photos/:userId/:photoId?"
                element={(
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <UserPhotos advancedFeaturesEnabled={advancedFeaturesEnabled} loggedInUser={loggedInUser} />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/comments/:userId"
                element={(
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <UserComments />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/photo/:photoId"
                element={(
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <SinglePhotoView />
                  </ProtectedRoute>
                )}
              />

              {/* Catch-all Route: Redirect to /login-register if not logged in */}
              <Route
                path="*"
                element={<Navigate to={isLoggedIn ? "/" : "/login-register"} replace />}
              />
            </Routes>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

// Render the PhotoShare component into the DOM
const root = ReactDOM.createRoot(document.getElementById("photoshareapp"));
root.render(
  <HashRouter>
    <PhotoShare />
  </HashRouter>
);

export default PhotoShare;
