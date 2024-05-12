const mongoose = require("mongoose");

const UserPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    lastSelectedBatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserPreference", UserPreferenceSchema);

const preferences = {};
