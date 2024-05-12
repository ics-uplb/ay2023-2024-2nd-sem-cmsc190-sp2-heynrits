const axios = require("axios");
const multer = require("multer");
const sharp = require("sharp");

const socketUtil = require("../utils/socket");

// models
const Organization = require("../models/organization/organization");
const Department = require("../models/organization/department");
const Role = require("../models/organization/role");
const User = require("../models/user");
const Notification = require("../models/notification");

// middlewares
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 3 * 1024 * 1024, // 3 MB
  },
});

// controllers
exports.getOrganizations = async (req, res) => {
  try {
    const organizations = await Role.find({
      userId: req.user._id,
      roles: {
        $nin: ["applicant"],
      },
      membershipStatus: "active",
    })
      .select("-userId")
      .populate("organizationId");

    return res.status(200).json({ organizations });
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.getOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    return res.status(200).json(organization);
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.getOrganizationByBatchId = async (req, res) => {
  try {
    const role = Role.find({
      userId: req.user._id,
      batch: req.params.batchId,
    });

    if (!role) {
      return res.status(404).json({ message: "Batch not found." });
    }

    const organization = await Organization.findById(role.organizationId);

    return res.status(200).json(organization);
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.createOrganization = async (req, res) => {
  upload.single("logo")(req, res, async function (err) {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message:
          "Image file size is too large. Please select one that's under 3 MB.",
      });
    } else {
      const { name, shortName, description } = req.body;
      try {
        let logo = null;
        if (req.file) {
          console.log(req.file);
          logo = await sharp(req.file.buffer).resize(500).toBuffer();
        }

        const orgData = {
          name,
          shortName,
          description,
          logo,
        };

        const organization = new Organization(orgData);
        await organization.save();

        const role = new Role({
          organizationId: organization._id,
          userId: req.user._id,
          roles: ["admin"],
          membershipStatus: "active",
          memberSince: new Date(),
          departmentId: null,
        });
        await role.save();

        // send data to OSAM
        const osamRes = await axios({
          method: "POST",
          url: `${process.env.OSAM_API_URL}/organizations`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OSAM_API_KEY}`,
          },
          data: {
            _id: organization._id,
            name,
            description,
          },
        });

        return res.status(201).json({ organization });
      } catch (error) {
        console.log({ error });
        return res.status(500).json({ message: "Something went wrong." });
      }
    }
  });
};

exports.updateOrganization = async (req, res) => {
  const { name, shortName, description } = req.body;
  try {
    // Update the organization
    const organization = await Organization.findOneAndUpdate(
      { _id: req.params.id },
      { name, shortName, description },
      { new: true }
    );
    return res.status(200).json(organization);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.updateOrganizationLogo = async (req, res) => {
  upload.single("logo")(req, res, async function (err) {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message:
          "Image file size is too large. Please select one that's under 3 MB.",
      });
    } else {
      try {
        if (!req.file) {
          return res.status(400).json({
            message: "Please upload an image.",
          });
        }

        const logo = await sharp(req.file.buffer).resize(500).toBuffer();

        const organization = await Organization.findById(req.params.id);
        if (!organization) {
          return res.status(404).json({ message: "Organization not found." });
        }

        organization.logo = logo;
        await organization.save();

        return res.status(201).json(organization);
      } catch (error) {
        return res.status(500).json({ message: "Something went wrong." });
      }
    }
  });
};

exports.removeOrganizationLogo = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found." });
    }
    organization.logo = null;
    await organization.save();

    return res.status(201).json(organization);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.deleteOrganization = async (req, res) => {
  try {
    // Delete the organization
    const organization = await Organization.findOneAndDelete({
      _id: req.params.id,
    });

    // Delete the roles
    await Role.deleteMany({
      organizationId: req.params.id,
    });

    return res.status(200).json({ organization });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
};

// roles
exports.getOrganizationRole = async (req, res) => {
  try {
    const role = await Role.findOne({
      organizationId: req.params.id,
      userId: req.user._id,
    });
    return res.status(200).json(role);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
};

// members

exports.getOrganizationMembers = async (req, res) => {
  try {
    const members = await Role.find({
      organizationId: req.params.id,
      roles: { $ne: "applicant" },
    })
      .select("-organizationId")
      .populate("userId")
      .populate("departmentId", "-organizationId");

    // sort by first name
    members.sort((a, b) => {
      const firstNameA = a.userId.firstName.toUpperCase();
      const firstNameB = b.userId.firstName.toUpperCase();
      if (firstNameA < firstNameB) {
        return -1;
      }
      if (firstNameA > firstNameB) {
        return 1;
      }
      return 0;
    });

    return res.status(200).json(members);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.updateOrganizationMember = async (req, res) => {
  try {
    const member = await Role.findOneAndUpdate(
      {
        organizationId: req.params.id,
        userId: req.params.memberId,
        roles: { $in: ["member", "officer", "admin"] },
      },
      req.body,
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ message: "Member not found." });
    }

    return res.status(200).json(member);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.inviteOrganizationMember = async (req, res) => {
  try {
    const { email, departmentId, roles } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User account does not exist." });
    }

    let role = await Role.findOne({
      organizationId: req.params.id,
      userId: user._id,
    });

    if (role) {
      const messages = {
        invited: `${user.firstName} ${user.lastName} (${user.email}) is already invited.`,
        active: `${user.firstName} ${user.lastName} (${user.email}) is already a member.`,
      };
      console.log(role);
      return res.status(400).json({ message: messages[role.membershipStatus] });
    }

    role = new Role({
      organizationId: req.params.id,
      userId: user._id,
      roles,
      membershipStatus: "invited",
      memberSince: null,
      departmentId,
    });
    await role.save();
    await role.populate("userId");

    // create a notification
    await socketUtil.notify(req.io, {
      type: "invite:membership",
      receiver: user._id,
      message: "You have been invited to join the organization.",
      context: {
        organization: req.params.id,
        role: role._id,
        sender: req.user._id,
      },
    });

    return res.status(201).json(role);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.respondToMembershipInvitation = async (req, res) => {
  let redirect = null;
  try {
    const role = await Role.findOne({
      organizationId: req.params.id,
      _id: req.params.roleId,
      userId: req.user._id,
    });

    if (!role) {
      return res.status(404).json({
        message: "You are not invited as a member to this organization.",
      });
    }

    const action = req.query.action;

    if (action === "accept") {
      role.membershipStatus = "active";
      role.memberSince = Date.now();
      await role.save();

      redirect = `/organizations/${req.params.id}`;
    } else if (action === "decline") {
      await Role.deleteOne({
        _id: req.params.roleId,
      });
    }

    // archive associated notification
    const notif = await Notification.findOne({
      type: "invite:membership",
      receiver: req.user._id,
      "context.organization": req.params.id,
      "context.role": role._id,
    });

    if (notif) {
      notif.archived = true;
      await notif.save();
    }

    // notify the admins
    const adminRoles = await Role.find({
      organizationId: req.params.id,
      roles: { $in: ["admin"] },
      userId: { $ne: req.user._id },
    });

    const actionPastTense = action === "accept" ? "accepted" : "declined";
    for (const adminRole of adminRoles) {
      // create notification for each admin
      await socketUtil.notify(req.io, {
        type: "invite-response:membership",
        receiver: adminRole.userId,
        message: `${req.user.firstName} ${req.user.lastName} has ${actionPastTense} your invitation to join the organization.`,
        context: {
          organization: req.params.id,
          sender: req.user._id,
          redirect: `/organizations/${req.params.id}/manage/members`,
        },
      });
    }

    res.status(200).json({ redirect });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.removeOrganizationMember = async (req, res) => {
  try {
    const member = await Role.findOneAndDelete({
      organizationId: req.params.id,
      userId: req.params.memberId,
    });

    if (!member) {
      return res.status(404).json({ message: "Member not found." });
    }

    const notif = await Notification.findOne({
      type: "invite:membership",
      receiver: req.params.memberId,
    });
    if (notif) {
      notif.archived = true;
      await notif.save();
    }

    return res.status(200).json(member);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

// departments

exports.getOrganizationDepartments = async (req, res) => {
  try {
    const departments = await Department.find({
      organizationId: req.params.id,
    })
      .select("-organizationId")
      .sort({ name: 1 });

    // get department size
    for (let i = 0; i < departments.length; i++) {
      departments[i] = departments[i].toObject();
      departments[i].size = await Role.countDocuments({
        departmentId: departments[i]._id,
      });
    }

    return res.status(200).json(departments);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.getOrganizationDepartment = async (req, res) => {
  try {
    const department = await Department.findOne({
      _id: req.params.departmentId,
    });

    if (!department) {
      return res.status(404).json({ message: "Department not found." });
    }

    // get department size
    department.size = await Role.countDocuments({
      departmentId: department._id,
    });

    return res.status(200).json(department);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.createOrganizationDepartment = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const exists = await Department.findOne({
      name,
      organizationId: id,
    });

    if (exists) {
      return res.status(400).json({ message: "Department already exists." });
    }

    const department = new Department({
      name,
      organizationId: id,
    });
    await department.save();

    return res.status(201).json(department);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.updateOrganizationDepartment = async (req, res) => {
  const { id, departmentId } = req.params;
  const { name } = req.body;

  try {
    const exists = await Department.findOne({
      name,
      organizationId: id,
    });

    if (exists) {
      return res.status(400).json({ message: "Department already exists." });
    }

    const department = await Department.findOneAndUpdate(
      { _id: departmentId },
      { name },
      { new: true }
    );
    return res.status(200).json(department);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.deleteOrganizationDepartment = async (req, res) => {
  try {
    // remove deparment assignment in Roles model
    await Role.updateMany(
      { departmentId: req.params.departmentId },
      { departmentId: null }
    );

    const department = await Department.findOneAndDelete({
      _id: req.params.departmentId,
    });

    return res.status(200).json(department);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
};
