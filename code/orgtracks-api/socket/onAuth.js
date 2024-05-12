const User = require("../models/user");
const { decodeLocalToken } = require("../utils/auth");
const onAuth = async (socket, next) => {
  const unauthorizedError = new Error("Unauthorized");
  const token = socket.handshake.auth.token;

  // Check if the token exists
  if (!token) {
    next(unauthorizedError);
  }

  try {
    // Decode the token to get the email and avatar
    const payload = await decodeLocalToken(token);
    if (!payload) {
      next(unauthorizedError);
    }

    const { email } = payload;

    // Find the user by email
    let user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      next(unauthorizedError);
    }

    user = user.toJSON();
    user.name = user.firstName + " " + user.lastName;

    socket.user = user;

    // success
    next();
  } catch (err) {
    next(unauthorizedError);
  }
};

module.exports = onAuth;
