const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    type: String,
    receiver: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    context: {
        organization: {
            type: mongoose.Types.ObjectId,
            ref: "Organization",
            default: null,
        },
        role: {
            type: mongoose.Types.ObjectId,
            ref: "Role",
            default: null,
        },
        sender: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            default: null,
        },
        redirect: {
          type: String,
          default: null,
        }
    },
    message: String,
    read: {
      type: Boolean,
      default: false,
    },
    archived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", NotificationSchema);
