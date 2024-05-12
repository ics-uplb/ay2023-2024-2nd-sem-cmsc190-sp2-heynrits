const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
    name: String,
    organizationId: {
        type: mongoose.Types.ObjectId,
        ref: "Organization",
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("Department", DepartmentSchema);