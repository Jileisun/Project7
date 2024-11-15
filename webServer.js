/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the project6 collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const express = require("express");
const app = express();
const fs = require("fs"); // File system module for saving uploaded files
const cors = require("cors");

const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

/* project 7 */
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");

const frontendOrigin = "http://localhost:3000"; 

app.use(cors({
  origin: frontendOrigin,
  credentials: true, // Allow cookies to be sent
}));

app.use(session({
  secret: "secretKey", // Replace with a strong secret in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true, // Mitigate XSS attacks
    secure: false,  // Set to true if using HTTPS
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
}));

app.use(bodyParser.json());
/* project 7 */

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.static(__dirname));

// Configure multer for handling photo uploads
const processFormBody = multer({ storage: multer.memoryStorage() }).single("uploadedphoto");

app.get("/", (request, response) => {
  response.send("Simple web server of files from " + __dirname);
});

app.get("/test/:p1", async (request, response) => {
  const param = request.params.p1 || "info";

  if (param === "info") {
    try {
      const info = await SchemaInfo.find({});
      if (info.length === 0) {
        return response.status(500).send("Missing SchemaInfo");
      }
      console.log("SchemaInfo", info[0]);
      return response.json(info[0]);
    } catch (err) {
      console.error("Error in /test/info:", err);
      return response.status(500).json(err);
    }
  } else if (param === "counts") {
    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];

    try {
      const counts = await Promise.all(
        collections.map(async (col) => {
          const count = await col.collection.countDocuments({});
          return { [col.name]: count };
        })
      );

      const obj = counts.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      return response.json(obj);
    } catch (err) {
      return response.status(500).json(err);
    }
  } else {
    return response.status(400).send("Bad param " + param);
  }
});

/* project 7 */
// Login route
app.post("/user", async (req, res) => {
  const { login_name, password, first_name, last_name, location, description, occupation } = req.body;

  // Validation
  if (!login_name) {
    return res.status(400).send("login_name is required.");
  }
  if (!password || password.trim() === "") {
    return res.status(400).send("password is required and cannot be empty.");
  }
  if (!first_name || first_name.trim() === "") {
    return res.status(400).send("first_name is required and cannot be empty.");
  }
  if (!last_name || last_name.trim() === "") {
    return res.status(400).send("last_name is required and cannot be empty.");
  }

  try {
    // Check if login_name already exists
    const existingUser = await User.findOne({ login_name });
    if (existingUser) {
      return res.status(400).send("login_name already exists.");
    }

    // Create new user
    const newUser = new User({
      login_name,
      password, // Insecure: Storing plaintext password
      first_name,
      last_name,
      location: location || "",
      description: description || "",
      occupation: occupation || "",
    });

    await newUser.save();

    // Respond with necessary user properties
    res.status(200).json({
      login_name: newUser.login_name,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      _id: newUser._id,
      // Add other fields if needed
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).send("Error registering user.");
  }
});

app.post("/admin/login", async (req, res) => {
  const { login_name, password } = req.body;

  // Check if `login_name` and `password` are provided
  if (!login_name || !password) {
    return res.status(400).send("Both login_name and password are required.");
  }

  try {
    // Find user by `login_name`
    const user = await User.findOne({ login_name });
    if (!user) {
      return res.status(400).send("Invalid login name or password.");
    }

    // Verify password
    if (user.password !== password) { // Insecure: Plaintext comparison
      return res.status(400).send("Invalid login name or password.");
    }

    // Store user ID in the session to mark them as logged in
    req.session.userId = user._id;

    // Respond with user information
    res.json({ _id: user._id, first_name: user.first_name, last_name: user.last_name });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Internal server error.");
  }
});


// Logout route
app.post("/admin/logout", (req, res) => {
  if (!req.session.userId) {
    return res.status(400).send("User is not logged in.");
  }

  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).send("Logout failed.");
    }
    res.sendStatus(200);
  });
});

// Session check endpoint to confirm if a user is logged in
app.get("/admin/checkSession", (req, res) => {
  if (req.session.userId) {
    User.findById(req.session.userId, "_id first_name last_name")
      .then(user => {
        if (user) {
          res.json({ _id: user._id, first_name: user.first_name, last_name: user.last_name });
        } else {
          res.status(401).send("Unauthorized");
        }
      })
      .catch(error => {
        console.error("Error checking session:", error);
        res.status(500).send("Internal server error");
      });
  } else {
    res.status(401).send("Unauthorized");
  }
});

// Define the isAuthenticated middleware before any API using it
function isAuthenticated(req, res, next) {
  if (!req.session.userId) {
      return res.status(401).send("Unauthorized: User not logged in.");
  }
  next();
}

// New route to handle photo uploads
app.post("/photos/new", isAuthenticated, (req, res) => {
  processFormBody(req, res, async function (err) {
    if (err || !req.file) {
      return res.status(400).send("Error uploading file");
    }

    const timestamp = new Date().valueOf();
    const filename = "U" + String(timestamp) + req.file.originalname;

    // Save file to the images directory
    fs.writeFile("./images/" + filename, req.file.buffer, async function (err) {
      if (err) {
        console.error("Error writing file:", err);
        return res.status(500).send("Error saving file");
      }

      try {
        // Create and save the new photo object
        const newPhoto = new Photo({
          file_name: filename,
          date_time: new Date(),
          user_id: req.session.userId, // Assuming user_id is stored in the session
        });

        const savedPhoto = await newPhoto.save();

        // Respond with both the photo ID and the user ID
        res.status(200).json({ _id: savedPhoto._id, user_id: req.session.userId });
      } catch (error) {
        console.error("Error saving photo to database:", error);
        res.status(500).send("Internal server error");
      }
    });
  });
});
/* project 7 */

app.get('/user/list', isAuthenticated, async (req, res) => {
  try {
    const users = await User.find({}, '_id first_name last_name');
    return res.json(users);
  } catch (error) {
    console.error('Error fetching user list:', error);
    return res.status(500).send('Internal server error.');
  }
});

app.get('/user/:id', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '_id first_name last_name location description occupation');
    if (!user) {
      return res.status(404).send('User not found.');
    }
    return res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    return res.status(400).send('Something other than the id of a User is provided.');
  }
});

app.get('/photosOfUser/:id', isAuthenticated, async (req, res) => {
  const userId = req.params.id;

  // Validate the user ID format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.log('Invalid user ID format:', userId);
    return res.status(400).send('Invalid user ID format.');
  }

  try {
    // Find photos for the given user ID
    const photos = await Photo.find({ user_id: userId }).select('_id user_id file_name date_time comments');

    // Check if any photos were found
    if (photos.length === 0) {
      console.log('No photos found for user with ID:', userId);
      return res.status(404).send('No photos found for this user.');
    }

    // Format each photo with populated comments
    const formattedPhotos = await Promise.all(
      photos.map(async (photo) => {
        // Format comments by populating the user details
        const comments = await Promise.all(
          photo.comments.map(async (comment) => {
            // Only add `user` instead of `user_id`
            if (mongoose.Types.ObjectId.isValid(comment.user_id)) {
              const user = await User.findById(comment.user_id).select('_id first_name last_name');
              return {
                _id: comment._id,
                comment: comment.comment,
                date_time: comment.date_time,
                user: user ? { _id: user._id, first_name: user.first_name, last_name: user.last_name } : null,
              };
            }
            return {
              _id: comment._id,
              comment: comment.comment,
              date_time: comment.date_time,
              user: null,
            };
          })
        );

        return {
          _id: photo._id,
          user_id: photo.user_id,
          file_name: photo.file_name,
          date_time: photo.date_time,
          comments,
        };
      })
    );

    // Send the formatted photos as the response
    return res.json(formattedPhotos);
  } catch (error) {
    console.error('Error fetching photos of user:', error.message);
    return res.status(500).send('Internal server error.');
  }
});

app.get('/photo/counts', isAuthenticated, async (req, res) => {
  try {
    const photos = await Photo.aggregate([{ $group: { _id: "$user_id", count: { $sum: 1 } } }]);
    const photoCounts = photos.reduce((acc, photo) => ({ ...acc, [photo._id]: photo.count }), {});
    return res.json(photoCounts);
  } catch (error) {
    console.error("Error fetching photo counts:", error);
    return res.status(500).send("Error fetching photo counts.");
  }
});

app.get('/comment/counts', isAuthenticated, async (req, res) => {
  try {
    const comments = await Photo.aggregate([
      { $unwind: "$comments" },
      { $group: { _id: "$comments.user_id", count: { $sum: 1 } } }
    ]);
    const commentCounts = comments.reduce((acc, comment) => ({ ...acc, [comment._id]: comment.count }), {});
    return res.json(commentCounts);
  } catch (error) {
    console.error("Error fetching comment counts:", error);
    return res.status(500).send("Error fetching comment counts.");
  }
});

app.get('/commentsByUser/:userId', isAuthenticated, async (req, res) => {
  try {
    const userId = req.params.userId;
    const comments = await Photo.find({ "comments.user_id": userId })
      .select("file_name comments")
      .then(photos => photos.flatMap(photo => photo.comments
          .filter(comment => comment.user_id.toString() === userId)
          .map(comment => ({
            _id: comment._id,
            text: comment.comment,
            date_time: comment.date_time,
            photo: {
              _id: photo._id,
              file_name: photo.file_name,
              user_id: photo.user_id
            }
          }))
      ));
    return res.json(comments);
  } catch (error) {
    console.error("Error fetching comments by user:", error);
    return res.status(500).send("Internal server error");
  }
});

app.get('/photo/:photoId', isAuthenticated, async (req, res) => {
  try {
    const { photoId } = req.params;

    const photo = await Photo.findById(photoId).exec();
    if (!photo) {
      return res.status(404).send('Photo not found');
    }

    const userIds = [...new Set(photo.comments.map(comment => comment.user_id))];
    const users = await User.find({ _id: { $in: userIds } }, 'first_name last_name').exec();

    const userMap = users.reduce((acc, user) => ({
      ...acc,
      [user._id.toString()]: { _id: user._id, first_name: user.first_name, last_name: user.last_name }
    }), {});

    const formattedComments = photo.comments.map(comment => ({
      ...comment._doc,
      user: userMap[comment.user_id.toString()] || { first_name: "Unknown", last_name: "User", _id: null },
    }));

    const formattedPhoto = {
      ...photo._doc,
      comments: formattedComments,
    };

    return res.json(formattedPhoto);
  } catch (error) {
    console.error('Error fetching photo details:', error);
    return res.status(500).send('Internal server error');
  }
});

/* project 7 */
/**
 * POST /commentsOfPhoto/:photo_id
 * Adds a comment to the specified photo.
 */
app.post("/commentsOfPhoto/:photo_id", isAuthenticated, async (req, res) => {
  const { photo_id } = req.params;
  const { comment } = req.body;

  // Reject empty comments
  if (!comment || comment.trim().length === 0) {
    return res.status(400).send("Comment cannot be empty.");
  }

  try {
    // Find the photo and add the new comment
    const photo = await Photo.findById(photo_id);
    if (!photo) {
      return res.status(404).send("Photo not found.");
    }

    const newComment = {
      comment: comment,
      date_time: new Date(),
      user_id: req.session.userId, // Assuming user ID is stored in session after login
    };

    photo.comments.push(newComment);
    await photo.save();

    res.status(200).json(newComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).send("Internal server error.");
  }
});
/* project 7 */

app.listen(3000, () => {
  console.log(
    `Listening at http://localhost:3000 exporting the directory ${__dirname}`
  );
});


