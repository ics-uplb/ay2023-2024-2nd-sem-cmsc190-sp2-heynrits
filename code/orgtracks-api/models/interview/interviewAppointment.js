const mongoose = require("mongoose");

const InterviewAppointmentSchema = new mongoose.Schema({
    interviewAssignmentId: {
        type: mongoose.Types.ObjectId,
        ref: "InterviewAssignment",
    },
    dtStart: Date,
    dtEnd: Date,
}, {
    timestamps: true,
});

module.exports = mongoose.model("InterviewAppointment", InterviewAppointmentSchema);