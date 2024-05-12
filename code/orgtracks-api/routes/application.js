const express = require("express");

const router = express.Router();

const applicationController = require("../controllers/application");
const interviewController = require("../controllers/interview");
const { authMiddleware } = require("../middlewares/auth");

// organization
router.get("/", authMiddleware, applicationController.getApplications);
router.get("/:orgId/status", authMiddleware, applicationController.getStatus);

router.get(
  "/interview-assignments/:interviewAssignmentId/calendar",
  authMiddleware,
  applicationController.getInterviewerCalendar
);
router.post(
  "/interview-assignments/:interviewAssignmentId",
  authMiddleware,
  applicationController.manageAppointment
);
router.get(
  "/interview-assignments/:interviewAssignmentId/feedback",
  authMiddleware,
  interviewController.getAllFeedback
);
router.post(
  "/interview-assignments/:interviewAssignmentId/feedback",
  authMiddleware,
  interviewController.addFeedback
);
router.put(
  "/interview-assignments/:interviewAssignmentId/feedback/:feedbackId",
  authMiddleware,
  interviewController.updateFeedback
);
router.delete(
  "/interview-assignments/:interviewAssignmentId/feedback/:feedbackId",
  authMiddleware,
  interviewController.removeFeedback
);

router.get(
  "/interview-appointments/calendar",
  authMiddleware,
  applicationController.getMyCalendarAsApplicant
);

// successful application transmission
router.post(
  "/batches/:batchId/evaluation/transmit",
  authMiddleware,
  applicationController.transmitApplicationResults
);

// evaluation
router.post(
  "/batches/:batchId/evaluation",
  authMiddleware,
  applicationController.evaluateApplicants
);
router.get(
  "/batches/:batchId/evaluation",
  authMiddleware,
  applicationController.getApplicationEvaluation
);
router.put(
  "/batches/:batchId/evaluation",
  authMiddleware,
  applicationController.updateApplicationEvaluation
);

module.exports = router;
