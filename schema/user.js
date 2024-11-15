"use strict";

const mongoose = require("mongoose");

/**
 * Define the Mongoose Schema for a Comment.
 */
// const userSchema = new mongoose.Schema({
//   login_name: String,
//   first_name: String,
//   last_name: String,
//   location: String,
//   description: String,
//   occupation: String,
// });
const userSchema = new mongoose.Schema({
  login_name: { type: String, required: true, unique: true },
  password_digest: { type: String, required: true }, // Hashed password
  salt: { type: String, required: true }, // Salt used for hashing
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  location: { type: String },
  description: { type: String },
  occupation: { type: String },
  // Add other fields as necessary
});
/**
 * Create a Mongoose Model for a User using the userSchema.
 */
const User = mongoose.model("User", userSchema);

/**
 * Make this available to our application.
 */
module.exports = User;
