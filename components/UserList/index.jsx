// UserList.jsx
import {
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../axiosConfig";
import "./styles.css";

function UserList({ advancedFeaturesEnabled, dependency }) {
  const [users, setUsers] = useState([]);
  const [photoCounts, setPhotoCounts] = useState({});
  const [commentCounts, setCommentCounts] = useState({});
  const query = `?advanced=${advancedFeaturesEnabled}`;

  const fetchUserListAndCounts = () => {
    axios.get("http://localhost:3000/user/list")
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Error fetching user list:", error));

    if (advancedFeaturesEnabled) {
      axios.get("http://localhost:3000/photo/counts")
        .then((response) => setPhotoCounts(response.data))
        .catch((error) => console.error("Error fetching photo counts:", error));

      axios.get("http://localhost:3000/comment/counts")
        .then((response) => setCommentCounts(response.data))
        .catch((error) => console.error("Error fetching comment counts:", error));
    }
  };

  // Re-fetch data when `advancedFeaturesEnabled` or `dependency` changes
  useEffect(() => {
    fetchUserListAndCounts();
  }, [advancedFeaturesEnabled, dependency]);

  return (
    <div className="user-list-container">
      <Typography variant="h6" gutterBottom className="user-list-heading">
        Users
      </Typography>
      <List component="nav">
        {users.map((user) => (
          <React.Fragment key={user._id}>
            <ListItem
              component={Link}
              to={`/users/${user._id}${query}`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              className="user-list-item"
            >
              <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <ListItemText primary={`${user.first_name} ${user.last_name}`} />
              </div>
              {advancedFeaturesEnabled && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                  <Badge badgeContent={photoCounts[user._id] || 0} color="success" />
                  <Link to={`/comments/${user._id}${query}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Badge badgeContent={commentCounts[user._id] || 0} color="error" />
                  </Link>
                </div>
              )}
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </div>
  );
}

export default UserList;






