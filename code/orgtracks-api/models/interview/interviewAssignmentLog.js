const mongoose = require("mongoose");

const InterviewAssignmentLogSchema = new mongoose.Schema({
    interviewAssignmentId: {
        type: mongoose.Types.ObjectId,
        ref: "InterviewAssignment",
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    action: String,
    data: Object,
}, {
    timestamps: true,
});

module.exports = mongoose.model("InterviewAssignmentLog", InterviewAssignmentLogSchema);