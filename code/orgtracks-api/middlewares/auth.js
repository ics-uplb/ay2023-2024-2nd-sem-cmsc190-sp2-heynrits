const dayjs = require("dayjs");
const User = require("../models/user");
const { decodeLocalToken } = require("../utils/auth");

/**
 * Middleware function for authentication.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function to call.
 * @returns {Promise} - A promise that resolves when the middleware is done.
 */
exports.authMiddleware = async (req, res, next) => {
  // Extract the token from the Authorization header
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  // Check if the token exists
  if (!token) {
    return res.status(401).json({ message: "Log in to continue." });
  }

  try {
    // Decode the token to get the email and avatar
    const payload = await decodeLocalToken(token);
    if (!payload) {
      return res.status(401).json({ message: "Invalid token." });
    }

    const { email, avatar } = payload;

    // Find the user by email
    let user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: "Invalid token." });
    }

    // Convert user to plain object and set avatar
    user = user.toObject();
    user.avatar = avatar;

    // Set the user to the app locals
    req.user = user;

    // Call the next middleware
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message:
        "There was a problem authenticating your account. Please try again later.",
    });
  }
};
