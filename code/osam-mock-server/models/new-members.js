const mongoose = require("mongoose");

const newMembersSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Types.ObjectId,
    ref: "Organization",
  },
  users: {
    type: [String],
    required: true,
  },
});

module.exports = mongoose.model("NewMembers", newMembersSchema);
