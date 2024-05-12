const mongoose = require("mongoose");

const BatchSchema = new mongoose.Schema({
    name: String,
    organizationId: {
        type: mongoose.Types.ObjectId,
        ref: "Organization",
    },
    archived: Boolean,
}, {
    timestamps: true,
});

module.exports = mongoose.model("Batch", BatchSchema);