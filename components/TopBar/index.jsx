import {
  AppBar,
  Button,
  Checkbox,
  FormControlLabel,
  Toolbar,
  Typography,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles.css";

function TopBar({
  onToggleAdvancedFeatures,
  advancedFeaturesEnabled,
  onLoginChange,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [contextText, setContextText] = useState("");
  const [version, setVersion] = useState("");
  const [user, setUser] = useState(null);
  const [isChecked, setIsChecked] = useState(advancedFeaturesEnabled);
  const uploadInputRef = useRef(null); // Reference for file input

  useEffect(() => {
    setIsChecked(advancedFeaturesEnabled);
  }, [advancedFeaturesEnabled]);

  const myName = "Cornelia (Zhouzhou) Chu";

  useEffect(() => {
    // Fetch version information from the backend
    axios
      .get("http://localhost:3000/test/info")
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
        .get(`http://localhost:3000/user/${userId}`)
        .then((response) => {
          const user = response.data;
          setContextText(`${user.first_name} ${user.last_name} Details`);
        })
        .catch((error) => console.error("Error fetching user details:", error));
    } else if (pathParts[1] === "photos" && userId) {
      axios
        .get(`http://localhost:3000/user/${userId}`)
        .then((response) => {
          const user = response.data;
          setContextText(`Photos of ${user.first_name} ${user.last_name}`);
        })
        .catch((error) => console.error("Error fetching user photos:", error));
    } else if (pathParts[1] === "comments" && userId) {
      axios
        .get(`http://localhost:3000/user/${userId}`)
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
      .get("http://localhost:3000/admin/checkSession")
      .then((response) => {
        setUser(response.data); // If session exists, update user state
      })
      .catch(() => {
        setUser(null); // No session, clear user state
      });
  }, [location]);

  const handleCheckboxChange = (e) => {
    const isEnabled = e.target.checked;
    setIsChecked(isEnabled);
    onToggleAdvancedFeatures(isEnabled);
  };

  useEffect(() => {
    axios
      .get("http://localhost:3000/admin/checkSession")
      .then((response) => {
        setUser(response.data);
        onLoginChange(true); // User is logged in
      })
      .catch(() => {
        setUser(null);
        onLoginChange(false); // User is not logged in
      });
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3000/admin/logout");
      setUser(null);
      navigate("/"); // Optionally redirect to home after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleLoginClick = () => {
    navigate("/admin/login"); // Navigate to login page
  };

  const handleUploadButtonClick = () => {
    if (uploadInputRef.current) {
      uploadInputRef.current.click();
    }
  };

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
        <Typography variant="h5" color="inherit" style={{ flexGrow: 1 }}>
          {myName}
        </Typography>

        {/* Display login state next to name */}
        {user ? (
          <span style={{ display: "flex", alignItems: "center", marginLeft: "10px" }}>
            <Typography variant="h6" color="inherit" style={{ marginRight: "8px" }}>
              Hi, {user.first_name}
            </Typography>
            <Button color="inherit" onClick={handleLogout} style={{ textTransform: "none" }}>
              Logout
            </Button>
            <Button
              color="inherit"
              onClick={handleUploadButtonClick}
              style={{ textTransform: "none", marginLeft: "8px" }}
            >
              Add Photo
            </Button>
            <input
              type="file"
              accept="image/*"
              ref={uploadInputRef}
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
          </span>
        ) : (
          <Button color="inherit" onClick={handleLoginClick} style={{ marginLeft: "10px" }}>
            Please Login
          </Button>
        )}

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

        <Typography variant="h6" color="inherit" style={{ marginLeft: "auto", marginRight: "16px" }}>
          {contextText}
        </Typography>

        <Typography variant="subtitle1" color="inherit" style={{ fontWeight: "bold" }}>
          Version: {version}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;








