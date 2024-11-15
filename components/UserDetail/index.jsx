import { Button, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "../../axiosConfig";
import "./styles.css";

function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:3000/user/${userId}`)
      .then((response) => setUser(response.data))
      .catch((error) => console.error("Error fetching user details:", error));
  }, [userId]);

  if (!user) {
    return <Typography variant="body1">Loading user details...</Typography>;
  }

  return (
    <div className="user-detail-container">
      <Typography variant="h4" gutterBottom>
        {`${user.first_name} ${user.last_name}`}
      </Typography>
      <Typography variant="body1" gutterBottom>
        <strong>Location:</strong> {user.location}
      </Typography>
      <Typography variant="body1" gutterBottom>
        <strong>Occupation:</strong> {user.occupation}
      </Typography>
      <Typography variant="body1" gutterBottom>
        <strong>Description:</strong> {user.description}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to={`/photos/${userId}`}
        style={{ marginTop: "16px" }}
      >
        View Photos
      </Button>
    </div>
  );
}

export default UserDetail;

