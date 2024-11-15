import { Grid, Paper } from "@mui/material";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import axios from "axios";

import LoginRegister from "./components/LoginRegister";
import SinglePhotoView from "./components/SinglePhotoView";
import TopBar from "./components/TopBar";
import UserComments from "./components/UserComments";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import "./styles/main.css";

function PhotoShare() {
  const [advancedFeaturesEnabled, setAdvancedFeaturesEnabled] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Check login status and fetch user details
  const checkLoginStatus = async () => {
    try {
      const response = await axios.get("http://localhost:3000/admin/checkSession");
      setIsLoggedIn(true);
      setLoggedInUser(response.data); // Assuming the response contains user data
    } catch {
      setIsLoggedIn(false);
      setLoggedInUser(null);
    }
  };

  useEffect(() => {
    const storedAdvancedState = JSON.parse(localStorage.getItem("advancedFeaturesEnabled")) || false;
    setAdvancedFeaturesEnabled(storedAdvancedState);
    checkLoginStatus();
  }, []);

  const handleLoginChange = (newStatus) => {
    setIsLoggedIn(newStatus);
  };

  const handleToggleAdvancedFeatures = (isEnabled) => {
    setAdvancedFeaturesEnabled(isEnabled);
    localStorage.setItem("advancedFeaturesEnabled", JSON.stringify(isEnabled));
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/user/list");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching user list:", error);
    }
  };

  // Fetch users after login
  const handleLoginSuccess = () => {
    fetchUsers();
    checkLoginStatus(); // Update login status and fetch user info after successful login
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TopBar
            onToggleAdvancedFeatures={handleToggleAdvancedFeatures}
            advancedFeaturesEnabled={advancedFeaturesEnabled}
            onLoginChange={handleLoginChange}
          />
        </Grid>
        <div className="main-topbar-buffer" />
        <Grid item sm={3}>
          <Paper className="main-grid-item">
            <UserList users={users} advancedFeaturesEnabled={advancedFeaturesEnabled} dependency={isLoggedIn} />
          </Paper>
        </Grid>
        <Grid item sm={9}>
          <Paper className="main-grid-item">
            <Routes>
              <Route path="/users/:userId" element={<UserDetail />} />
              <Route
                path="/photos/:userId/:photoId?"
                element={<UserPhotos advancedFeaturesEnabled={advancedFeaturesEnabled} loggedInUser={loggedInUser} />}
              />
              <Route path="/comments/:userId" element={<UserComments />} />
              <Route path="/photo/:photoId" element={<SinglePhotoView />} />
              <Route path="/admin/login" element={<LoginRegister onLoginSuccess={handleLoginSuccess} />} />
            </Routes>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("photoshareapp"));
root.render(
  <HashRouter>
    <PhotoShare />
  </HashRouter>
);

export default PhotoShare;










