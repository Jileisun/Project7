/**
 * This Node.js program loads the Project 6 model data into Mongoose
 * defined objects in a MongoDB database. It can be run with the command:
 *     node loadDatabase.js
 * Be sure to have an instance of the MongoDB running on the localhost.
 *
 * This script loads the data into the MongoDB database named 'project6'.
 * It loads into collections named User and Photos. The Comments are added in
 * the Photos of the comments. Any previous objects in those collections are
 * discarded.
 */

const mongoose = require("mongoose");
const password = require("./password.js"); // Import the password module
mongoose.Promise = require("bluebird");
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Get the models we used in the previous projects.
const models = require("./modelData/photoApp.js").models;

// Load the Mongoose schema for User and Photo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

const versionString = "1.0";

// We start by removing anything that exists in the collections.
const removePromises = [
  User.deleteMany({}),
  Photo.deleteMany({}),
  SchemaInfo.deleteMany({}),
];

Promise.all(removePromises)
  .then(async function () {
    // Load the users into the User collection.
    const userModels = models.userListModel();
    const mapFakeId2RealId = {};

    // Process each user model
    const userPromises = userModels.map(async function (user) {
      try {
        // Generate a salted and hashed password entry
        const passwordEntry = password.makePasswordEntry("weak"); // Use "weak" as default password

        // Create a new User document with the hashed password and salt
        const userObj = await User.create({
          first_name: user.first_name,
          last_name: user.last_name,
          location: user.location,
          description: user.description,
          occupation: user.occupation,
          login_name: user.last_name.toLowerCase(),
          password_digest: passwordEntry.hash, // Store the hashed password
          salt: passwordEntry.salt, // Store the salt
        });

        // Map the fake ID to the real MongoDB _id
        mapFakeId2RealId[user._id] = userObj._id;
        user.objectID = userObj._id;

        console.log(
          "Adding user:",
          user.first_name + " " + user.last_name,
          " with ID ",
          user.objectID
        );
      } catch (err) {
        console.error("Error creating user", err);
      }
    });

    // Wait for all users to be created
    await Promise.all(userPromises);

    // Once all users are loaded, proceed to load photos
    const photoModels = [];
    const userIDs = Object.keys(mapFakeId2RealId);
    userIDs.forEach(function (id) {
      photoModels.push(...models.photoOfUserModel(id));
    });

    // Process each photo model
    const photoPromises = photoModels.map(async function (photo) {
      try {
        // Create a new Photo document
        const photoObj = await Photo.create({
          file_name: photo.file_name,
          date_time: photo.date_time,
          user_id: mapFakeId2RealId[photo.user_id],
        });

        // If the photo has comments, add them
        if (photo.comments && Array.isArray(photo.comments)) {
          // Prepare comments with the correct user_id references
          const formattedComments = photo.comments.map((comment) => ({
            comment: comment.comment,
            date_time: comment.date_time,
            user_id: mapFakeId2RealId[comment.user._id], // Use comment.user._id
          }));

          // Add comments to the photo
          photoObj.comments = photoObj.comments.concat(formattedComments);
          await photoObj.save();

          formattedComments.forEach((comment) => {
            console.log(
              "Adding comment of length %d by user %s to photo %s",
              comment.comment.length,
              comment.user_id,
              photo.file_name
            );
          });
        }

        console.log(
          "Adding photo:",
          photo.file_name,
          " of user ID ",
          photoObj.user_id
        );
      } catch (err) {
        console.error("Error creating photo", err);
      }
    });

    // Wait for all photos to be created
    await Promise.all(photoPromises);

    // Create the SchemaInfo object
    try {
      const schemaInfo = await SchemaInfo.create({
        version: versionString,
      });
      console.log(
        "SchemaInfo object created with version ",
        schemaInfo.version
      );
    } catch (err) {
      console.error("Error creating schemaInfo", err);
    }

    // Disconnect from MongoDB after all operations are complete
    mongoose.disconnect();
  })
  .catch(function (err) {
    console.error("Error during database setup:", err);
  });
