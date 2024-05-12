exports.socketMiddleware = (io) => (req, res, next) => {
  req.io = io;
  next();
};
