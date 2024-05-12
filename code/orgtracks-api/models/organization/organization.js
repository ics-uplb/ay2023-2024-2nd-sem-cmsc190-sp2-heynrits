const mongoose = require("mongoose");
const { Binary } = require("bson");

const OrganizationSchema = new mongoose.Schema(
  {
    name: String,
    shortName: String,
    description: String,
    logo: {
      type: Buffer,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Organization", OrganizationSchema);
