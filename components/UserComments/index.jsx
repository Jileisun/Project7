import { Card, CardContent, CardMedia, Typography, Link as MuiLink } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import axios from "../../axiosConfig";
import "./styles.css";

function UserComments() {
  const { userId } = useParams();
  const [comments, setComments] = useState([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    axios.get(`http://localhost:3000/user/${userId}`)
      .then((response) => setUserName(`${response.data.first_name} ${response.data.last_name}`))
      .catch((error) => console.error("Error fetching user info:", error));

    axios.get(`http://localhost:3000/commentsByUser/${userId}`)
      .then((response) => setComments(response.data))
      .catch((error) => console.error("Error fetching user comments:", error));
  }, [userId]);

  return (
    <div className="user-comments-container">
      <Typography variant="h5" gutterBottom>
        Comments by {userName}
      </Typography>
      {comments.map((comment) => (
        <MuiLink
          component={RouterLink}
          to={`/photo/${comment.photo._id}`}
          style={{ textDecoration: "none" }}
          key={comment._id}
        >
          <Card className="comment-card">
            <CardMedia
              component="img"
              height="100"
              image={`/images/${comment.photo.file_name}`}
              alt="User Commented Photo"
              className="comment-thumbnail"
            />
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                Commented on {new Date(comment.date_time).toLocaleString()}
              </Typography>
              <Typography variant="body1">{comment.text}</Typography>
              <Typography variant="body2" color="primary" style={{ marginTop: "8px" }}>
                View Full Photo
              </Typography>
            </CardContent>
          </Card>
        </MuiLink>
      ))}
    </div>
  );
}

export default UserComments;








