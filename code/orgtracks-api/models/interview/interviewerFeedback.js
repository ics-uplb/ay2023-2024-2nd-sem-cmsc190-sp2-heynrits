const mongoose = require("mongoose");

// feedback of interviewer to applicant
const InterviewerFeedbackSchema = new mongoose.Schema({
    batch: {
        type: mongoose.Types.ObjectId,
        ref: "Batch",
    },
    applicant: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    interviewer: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    visibility: String,
    content: String,
}, {
    timestamps: true,
});

module.exports = mongoose.model("InterviewerFeedback", InterviewerFeedbackSchema);
