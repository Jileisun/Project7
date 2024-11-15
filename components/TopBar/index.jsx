// src/components/TopBar.js
import {
  AppBar,
  Button,
  Checkbox,
  FormControlLabel,
  Toolbar,
  Typography,
} from "@mui/material";
import axios from "../../axiosConfig";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles.css";

/**
 * TopBar Component
 * 
 * Displays the application's top navigation bar.
 * Shows user information and provides login/logout functionality.
 */
function TopBar({
  onToggleAdvancedFeatures,
  advancedFeaturesEnabled,
  onLoginChange,
  isLoggedIn,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [contextText, setContextText] = useState("");
  const [version, setVersion] = useState("");
  const [user, setUser] = useState(null);
  const [isChecked, setIsChecked] = useState(advancedFeaturesEnabled);
  const uploadInputRef = useRef(null); // Reference for file input

  /**
   * Update the checkbox state when advancedFeaturesEnabled changes
   */
  useEffect(() => {
    setIsChecked(advancedFeaturesEnabled);
  }, [advancedFeaturesEnabled]);

  const myName = "Cornelia (Zhouzhou) Chu";

  /**
   * useEffect Hook
   * 
   * Runs whenever the route changes to:
   * - Fetch version information from the backend.
   * - Determine and set the context text based on the current route.
   * - Check the user's session to update the user state.
   */
  useEffect(() => {
    // Fetch version information from the backend
    axios
      .get("/test/info")
      .then((response) => {
        setVersion(response.data.version);
      })
      .catch((error) => {
        console.error("Error fetching version:", error);
      });

    // Determine context text based on the current route
    const pathParts = location.pathname.split("/");
    const userId = pathParts[2];

    if (pathParts[1] === "users" && userId) {
      axios
        .get(`/user/${userId}`)
        .then((response) => {
          const user = response.data;
          setContextText(`${user.first_name} ${user.last_name} Details`);
        })
        .catch((error) => console.error("Error fetching user details:", error));
    } else if (pathParts[1] === "photos" && userId) {
      axios
        .get(`/user/${userId}`)
        .then((response) => {
          const user = response.data;
          setContextText(`Photos of ${user.first_name} ${user.last_name}`);
        })
        .catch((error) => console.error("Error fetching user photos:", error));
    } else if (pathParts[1] === "comments" && userId) {
      axios
        .get(`/user/${userId}`)
        .then((response) => {
          const user = response.data;
          setContextText(`${user.first_name} ${user.last_name}'s Comments`);
        })
        .catch((error) => console.error("Error fetching user comments:", error));
    } else if (pathParts[1] === "photo" && pathParts[2]) {
      setContextText("Full Photo");
    } else {
      setContextText("Home");
    }

    // Check session for login state
    axios
      .get("/admin/checkSession")
      .then((response) => {
        setUser(response.data); // If session exists, update user state
      })
      .catch(() => {
        setUser(null); // No session, clear user state
      });
  }, [location]);

  /**
   * handleCheckboxChange
   * 
   * Handles the toggling of the advanced features checkbox.
   * 
   * @param {Event} e - The change event.
   */
  const handleCheckboxChange = (e) => {
    const isEnabled = e.target.checked;
    setIsChecked(isEnabled);
    onToggleAdvancedFeatures(isEnabled);
  };

  /**
   * useEffect Hook
   * 
   * Runs once on component mount to check the user's session.
   * Updates the user state and login status accordingly.
   */
  useEffect(() => {
    axios
      .get("/admin/checkSession")
      .then((response) => {
        setUser(response.data);
        onLoginChange(true); // User is logged in
      })
      .catch(() => {
        setUser(null);
        onLoginChange(false); // User is not logged in
      });
  }, [onLoginChange]);

  /**
   * handleLogout
   * 
   * Logs the user out by calling the server's logout endpoint.
   * Updates the user state and navigates to the login page.
   */
  const handleLogout = async () => {
    try {
      await axios.post("/admin/logout");
      setUser(null);
      onLoginChange(false); // Update login status
      navigate("/login-register"); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  /**
   * handleLoginClick
   * 
   * Navigates the user to the login/register page.
   */
  const handleLoginClick = () => {
    navigate("/login-register"); // Navigate to login/register page
  };

  /**
   * handleUploadButtonClick
   * 
   * Triggers the hidden file input to upload a photo.
   */
  const handleUploadButtonClick = () => {
    if (uploadInputRef.current) {
      uploadInputRef.current.click();
    }
  };

  /**
   * handleFileUpload
   * 
   * Handles the file upload process when a user selects a photo.
   * 
   * @param {Event} event - The file input change event.
   */
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("uploadedphoto", file);

    try {
      const response = await axios.post("/photos/new", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Assuming server returns the new photo's `_id` and `user_id`
      const { _id, user_id } = response.data;

      // Redirect to the user's photo page with focus on the newly uploaded photo
      navigate(`/photos/${user_id}/${_id}`);
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
  };

  return (
    <AppBar className="topbar-appBar" position="static">
      <Toolbar>
        {/* Application Name */}
        <Typography variant="h5" color="inherit" style={{ flexGrow: 1 }}>
          {myName}
        </Typography>

        {/* Display user information and logout/login buttons */}
        {user ? (
          <span style={{ display: "flex", alignItems: "center", marginLeft: "10px" }}>
            {/* Greeting */}
            <Typography variant="h6" color="inherit" style={{ marginRight: "8px" }}>
              Hi, {user.first_name}
            </Typography>
            {/* Logout Button */}
            <Button color="inherit" onClick={handleLogout} style={{ textTransform: "none" }}>
              Logout
            </Button>
            {/* Add Photo Button */}
            <Button
              color="inherit"
              onClick={handleUploadButtonClick}
              style={{ textTransform: "none", marginLeft: "8px" }}
            >
              Add Photo
            </Button>
            {/* Hidden File Input for Photo Upload */}
            <input
              type="file"
              accept="image/*"
              ref={uploadInputRef}
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
          </span>
        ) : (
          // Display "Please Login" button when not logged in
          <Button color="inherit" onClick={handleLoginClick} style={{ marginLeft: "10px" }}>
            Please Login
          </Button>
        )}

        {/* Advanced Features Toggle */}
        <FormControlLabel
          control={
            <Checkbox
              checked={isChecked}
              onChange={handleCheckboxChange}
              name="enableAdvancedFeatures"
              color="default"
            />
          }
          label="Enable Advanced Features"
          style={{ marginLeft: "auto" }}
        />

        {/* Contextual Text Based on Route */}
        <Typography variant="h6" color="inherit" style={{ marginLeft: "auto", marginRight: "16px" }}>
          {contextText}
        </Typography>

        {/* Version Information */}
        <Typography variant="subtitle1" color="inherit" style={{ fontWeight: "bold" }}>
          Version: {version}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
