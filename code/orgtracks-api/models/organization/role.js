const mongoose = require("mongoose");


const RoleSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Types.ObjectId,
        ref: "Organization",
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    roles: [String],
    membershipStatus: String,
    memberSince: {
        type: Date,
        default: null,
    },
    departmentId: {
        type: mongoose.Types.ObjectId,
        ref: "Department",
        default: null,
    },
    batch: {
        type: mongoose.Types.ObjectId,
        ref: "Batch",
        default: null,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("Role", RoleSchema);