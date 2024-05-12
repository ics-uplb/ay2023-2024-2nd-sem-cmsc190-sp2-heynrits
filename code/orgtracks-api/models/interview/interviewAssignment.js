const mongoose = require("mongoose");
const interview = require("../../constants/interview");

const InterviewAssignmentSchema = new mongoose.Schema({
    batchId: {
        type: mongoose.Types.ObjectId,
        ref: "Batch",
    },
    applicantId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        default: null,
    },
    interviewerId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    mandatory: Boolean,
    status: {
        default: "unscheduled",
        type: String,
        enum: Object.keys(interview.STATUSES),
    },
    appointment: {
        type: mongoose.Types.ObjectId,
        ref: "InterviewAppointment",
        default: null,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("InterviewAssignment", InterviewAssignmentSchema);