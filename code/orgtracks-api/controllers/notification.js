const User = require("../models/user");
const Notification = require("../models/notification");
const Organization = require("../models/organization/organization");
const Role = require("../models/organization/role");

exports.getNotifsByUser = async (req, res) => {
  try {
    const notifs = await Notification.find({
      receiver: req.user._id,
      archived: false,
    }).sort("-createdAt");

    // fill the context based on the type
    for (let i = 0; i < notifs.length; i++) {
      const notif = notifs[i];

      if (notif.type.startsWith("invite:")) {
        let { organization, role, sender } = notif.context;
        notif.context = {
          organization: await Organization.findById(organization),
          role: await Role.findById(role),
          sender: await User.findById(sender),
        };
      } else if (notif.type.startsWith("invite-response:")) {
        let { organization, sender } = notif.context;
        notif.context = {
          ...notif.context,
          organization: await Organization.findById(organization),
          sender: await User.findById(sender),
        };
      } else if (notif.type === "appointment") {
        let { organization, sender } = notif.context;
        notif.context = {
          ...notif.context,
          organization: await Organization.findById(organization),
          sender: await User.findById(sender),
        };
      } else if (notif.type === "interviewer-feedback") {
        let { organization, sender } = notif.context;
        notif.context = {
          ...notif.context,
          organization: await Organization.findById(organization),
          sender: await User.findById(sender),
        };
      }
    }

    const unreadCount = await Notification.countDocuments({
      receiver: req.user._id,
      read: false,
      archived: false,
    });

    return res.status(200).json({ notifs, unreadCount });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findOne({
      _id: req.params.notifId,
      receiver: req.user._id,
    });

    if (!notif) {
      return res.status(404).json({ message: "Notification not found." });
    }

    notif.read = true;
    await notif.save();

    return res.status(200).json(notif);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
};
