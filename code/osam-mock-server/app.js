const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

// models
const Organization = require("./models/organization.js");
const NewMembers = require("./models/new-members.js");

// middleware
const { authMiddleware } = require("./middlewares.js");

// config
require("dotenv").config();

// server
const app = express();

// middleware setup
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json

// mongodb connection
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || "27017";
const DB_NAME = process.env.DB_NAME || "osam_mock";
const DB_URL =
  process.env.DB_STRING || `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
mongoose
  .connect(DB_URL)
  .then(() => console.log("OSAM Mock Server: MongoDB connected"))
  .catch((err) => console.log(err));

// routes
app.get("/api", (req, res) => {
  res.status(200).json({
    name: "OSAM Mock API",
    version: "0.0.1",
    author: "John Heinrich Austria",
  });
});

app.post("/api/organizations", authMiddleware, async (req, res) => {
  const { _id, name, description } = req.body;

  try {
    const organization = new Organization({
      _id,
      name,
      description,
    });

    await organization.save();

    res.status(201).json({ message: "Organization created successfully." });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong." });
  }
});

app.post(
  "/api/organizations/:organizationId/roster/add",
  authMiddleware,
  async (req, res) => {
    const { organizationId } = req.params;
    const { users } = req.body;

    try {
      const organization = await Organization.findOne({ _id: organizationId });

      if (!organization) {
        return res.status(404).json({ message: "Organization not found." });
      }

      const newMembers = new NewMembers({
        organization,
        users,
      });

      await newMembers.save();

      res.status(201).json({ message: "New members added to the roster!." });
    } catch (err) {
      res.status(500).json({ message: "Something went wrong." });
    }
  }
);

// get PORT from node env
const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`OSAM Mock Server: Started on port ${PORT}.`);
});
