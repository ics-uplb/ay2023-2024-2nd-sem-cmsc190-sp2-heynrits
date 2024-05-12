const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
});

module.exports = mongoose.model("Organization", organizationSchema);
