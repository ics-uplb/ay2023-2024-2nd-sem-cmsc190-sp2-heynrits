const { createServer } = require("http");
const { Server } = require("socket.io");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");

const socket = require("./socket");

const routes = require("./routes");
const { socketMiddleware } = require("./middlewares/socket");

require("dotenv").config();

const app = express();

// middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(morgan("tiny"));

// mongodb connection
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || "27017";
const DB_NAME = process.env.DB_NAME || "orgtracks";
const DB_URL =
  process.env.DB_STRING || `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
mongoose
  .connect(DB_URL)
  .then(() => console.log("OrgTracks API: MongoDB connected"))
  .catch((err) => console.log(err));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", process.env.FRONTEND_URL],
  },
});
app.use(socketMiddleware(io));

io.use(socket.onAuth);
io.on("connection", socket.onConnection);

// routes
app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api", (req, res) => {
  res.status(200).json({
    name: "OrgTracks API",
    version: "0.0.1",
    author: "John Heinrich Austria",
  });
});

// get PORT from node env
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`OrgTracks API: Server started on port ${PORT}.`);
});
