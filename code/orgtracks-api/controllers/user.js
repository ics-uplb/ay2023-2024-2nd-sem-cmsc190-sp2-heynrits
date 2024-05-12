const User = require("../models/user");
const { decodeGoogleToken, generateLocalToken } = require("../utils/auth");

/**
 * Register a user
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
exports.register = async (req, res) => {
  try {
    // Extract the credential from the request body
    const { credential } = req.body;

    // Decode the Google token to get the user information
    const { email, given_name, family_name, picture } = await decodeGoogleToken(
      credential
    );

    // Check if the user already exists in the database
    let user = await User.findOne({ email });
    if (user) {
      // If the user exists, generate a local token and return it
      const token = generateLocalToken({ ...user.toObject(), avatar: picture });
      return res.status(200).json({
        message: "Account already exists! Logging in...",
        token,
      });
    }

    // If the user does not exist, create a new user in the database
    user = new User({
      email,
      firstName: given_name,
      lastName: family_name,
      avatar: picture,
    });
    await user.save();

    // Generate a local token for the new user and return it
    const token = generateLocalToken({ ...user.toObject(), avatar: picture });
    return res.status(201).json({
      message: "Account created! Logging in...",
      token,
    });
  } catch (error) {
    // Handle any errors that occur during registration
    console.error(error);
    res.status(500).json({
      message:
        "There was an error creating your account. Please try again later.",
    });
  }
};

/**
 * Logs in a user using their Google credential.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with a message and token.
 */
exports.login = async (req, res) => {
  const { credential } = req.body;

  try {
    const { email, picture } = await decodeGoogleToken(credential);

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(403).json({
        message:
          "You do not have an account yet! Please register first to continue.",
      });
    }

    const token = generateLocalToken({
      ...user.toObject(),
      avatar: picture,
    });

    return res.status(200).json({ message: "OK", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "There was an error logging in. Please try again later.",
    });
  }
};

/**
 * Retrieves the user from the request and sends it as a JSON response.
 * [uses authMiddleware]
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {undefined} The function does not return a value.
 */
exports.getUser = async (req, res) => {
  res.status(200).json({ ...req.user });
};
