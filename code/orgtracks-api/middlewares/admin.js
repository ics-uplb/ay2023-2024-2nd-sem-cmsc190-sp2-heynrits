const Role = require("../models/organization/role");

/**
 * Checks if the authenticated user has the admin role for a specific organization.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @return {void}
 */
exports.isAdmin = async (req, res, next) => {
  // check if the authenticated user has the admin role for that organization
  const role = await Role.findOne({
    userId: req.user._id,
    organizationId: req.params.id,
  });

  if (!role || !role.roles.includes("admin")) {
    return res
      .status(403)
      .json({ message: "You do not have an access to this resource." });
  }

  next();
};
