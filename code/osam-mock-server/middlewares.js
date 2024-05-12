exports.authMiddleware = (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const validAuth = token === process.env.OSAM_API_KEY;

  if (!validAuth) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  next();
};
