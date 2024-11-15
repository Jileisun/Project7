import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import axios from "../../axiosConfig";
import "./styles.css";

function UserPhotos({ advancedFeaturesEnabled, loggedInUser }) {
  const { userId, photoId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [userName, setUserName] = useState("");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [newComment, setNewComment] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user photos and set initial index based on photoId
    axios
      .get(`http://localhost:3000/photosOfUser/${userId}`)
      .then((response) => {
        setPhotos(response.data);

        if (photoId) {
          const index = response.data.findIndex((photo) => photo._id === photoId);
          setCurrentPhotoIndex(index !== -1 ? index : 0);
        } else {
          setCurrentPhotoIndex(0);
        }
      })
      .catch((error) => console.error("Error fetching user photos:", error));

    // Fetch user's name for display
    axios
      .get(`http://localhost:3000/user/${userId}`)
      .then((response) => {
        const user = response.data;
        setUserName(`${user.first_name} ${user.last_name}`);
      })
      .catch((error) => console.error("Error fetching user name:", error));
  }, [userId, photoId]);

  useEffect(() => {
    // Update URL with current photoId when navigating with stepper
    if (advancedFeaturesEnabled && photos.length > 0) {
      const currentPhoto = photos[currentPhotoIndex];
      if (currentPhoto && currentPhoto._id !== photoId) {
        navigate(`/photos/${userId}/${currentPhoto._id}`, { replace: true });
      }
    }
  }, [currentPhotoIndex, advancedFeaturesEnabled, photos, userId, navigate, photoId]);

  // Handlers for next and previous buttons in stepper mode
  const handleNext = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  // Submit new comment
  const handleCommentSubmit = async (photo_id) => {
    if (!newComment.trim()) {
      alert("Comment cannot be empty!");
      return;
    }

    try {
      const response = await axios.post(`/commentsOfPhoto/${photo_id}`, {
        comment: newComment,
      });

      // Include loggedInUser details in the comment immediately after submission
      const newCommentWithUser = {
        ...response.data,
        user: {
          _id: loggedInUser._id,
          first_name: loggedInUser.first_name,
          last_name: loggedInUser.last_name,
        },
      };

      // Find the photo in photos array and update comments with the loggedInUser details
      const updatedPhotos = photos.map((photo) => (photo._id === photo_id
          ? { ...photo, comments: [...photo.comments, newCommentWithUser] }
          : photo)
      );

      setPhotos(updatedPhotos); // Update state with new comment
      setNewComment(""); // Clear the input
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment.");
    }
  };

  // Render a single photo card with safe comment rendering
  const renderPhotoCard = (photo) => (
    <Card key={photo._id} className="photo-card" style={{ maxWidth: "100%" }}>
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
        <Divider style={{ margin: "8px 0" }} />
        <Typography variant="body2" color="textSecondary">
          Comments:
        </Typography>
        {Array.isArray(photo.comments) && photo.comments.length > 0 ? (
          photo.comments.map((comment) => (
            <div key={comment._id} className="comment-section">
              <Typography variant="caption" color="textSecondary">
                {comment.user ? (
                  <Link
                    component={RouterLink}
                    to={`/users/${comment.user._id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <strong>{`${comment.user.first_name} ${comment.user.last_name}`}</strong>
                  </Link>
                ) : (
                  <strong>Unknown User</strong>
                )}{" "}
                commented on {new Date(comment.date_time).toLocaleString()}
              </Typography>
              <Typography variant="body2" style={{ marginTop: "4px" }}>
                {comment.comment}
              </Typography>
              <Divider style={{ margin: "8px 0" }} />
            </div>
          ))
        ) : (
          <Typography variant="caption" color="textSecondary">
            No comments for this photo.
          </Typography>
        )}
        {/* Add comment input and button */}
        <TextField
          label="Add a comment"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          fullWidth
          multiline
          rows={2}
          variant="outlined"
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleCommentSubmit(photo._id)}
        >
          Submit Comment
        </Button>
      </CardContent>
    </Card>
  );

  if (photos.length === 0) {
    return <Typography variant="body1">No photos available for {userName}.</Typography>;
  }

  return (
    <div className="user-photos-container">
      <Typography variant="h5" gutterBottom>
        Photos of {userName}
      </Typography>

      {advancedFeaturesEnabled ? (
        // Stepper mode (show one photo at a time)
        <div>
          {renderPhotoCard(photos[currentPhotoIndex])}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handlePrev}
              disabled={currentPhotoIndex === 0}
            >
              Previous
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={currentPhotoIndex === photos.length - 1}
            >
              Next
            </Button>
          </div>
        </div>
      ) : (
        // Default mode (show all photos in a list)
        photos.map((photo) => renderPhotoCard(photo))
      )}
    </div>
  );
}

export default UserPhotos;











