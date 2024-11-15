import React, { useEffect, useState } from "react";
import { Card, CardContent, CardMedia, Typography, Link as MuiLink } from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import axios from "axios";
import "./styles.css";


function SinglePhotoView() {
  const { photoId } = useParams();
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    // Fetch the photo details from the backend
    axios
      .get(`http://localhost:3000/photo/${photoId}`)
      .then((response) => setPhoto(response.data))
      .catch((error) => console.error("Error fetching photo:", error));
  }, [photoId]);

  if (!photo) {
    return <Typography variant="body1">Loading photo...</Typography>;
  }

  return (
    <Card className="photo-card" style={{ maxWidth: "100%" }}>
      <CardMedia
        component="img"
        height="600"
        image={`/images/${photo.file_name}`}
        alt="User Photo"
      />
      <CardContent>
        <Typography variant="body2" color="textSecondary">
          Created on: {new Date(photo.date_time).toLocaleString()}
        </Typography>
        <Typography variant="h6" style={{ marginTop: "16px" }}>Comments:</Typography>
        {Array.isArray(photo.comments) && photo.comments.length > 0 ? (
          photo.comments.map((comment) => (
            <div key={comment._id} className="comment-section" style={{ marginBottom: "12px" }}>
              <Typography variant="caption" color="textSecondary">
                {/* Ensure user._id is correctly used here */}
                {comment.user && comment.user._id ? (
                  <MuiLink
                    component={RouterLink}
                    to={`/users/${comment.user._id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <strong>{`${comment.user.first_name} ${comment.user.last_name}`}</strong>
                  </MuiLink>
                ) : (
                  <span>Unknown User</span>
                )}{" "}
                commented on {new Date(comment.date_time).toLocaleString()}
              </Typography>
              <Typography variant="body2" style={{ marginTop: "4px" }}>
                {comment.comment}
              </Typography>
            </div>
          ))
        ) : (
          <Typography variant="caption" color="textSecondary">
            No comments for this photo.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default SinglePhotoView;










