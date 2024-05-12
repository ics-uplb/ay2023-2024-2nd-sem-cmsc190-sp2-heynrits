const mongoose = require("mongoose");

const ApplicationEvaluationSchema = new mongoose.Schema(
  {
    batch: {
      type: mongoose.Types.ObjectId,
      ref: "Batch",
    },
    evaluator: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    applicants: {
      accepted: {
        type: [mongoose.Types.ObjectId],
        ref: "User",
      },
      rejected: {
        type: [mongoose.Types.ObjectId],
        ref: "User",
      },
    },
    transmissionDate: { // to OSAM
        type: Date,
        default: null
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ApplicationEvaluation",
  ApplicationEvaluationSchema
);
