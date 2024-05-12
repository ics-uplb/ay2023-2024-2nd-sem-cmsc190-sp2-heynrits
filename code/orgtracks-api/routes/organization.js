const express = require("express");

const router = express.Router();

const { isAdmin } = require("../middlewares/admin");
const { authMiddleware } = require("../middlewares/auth");

const organizationController = require("../controllers/organization");
const applicationController = require("../controllers/application");
const interviewController = require("../controllers/interview");

// organization
router.get("/", organizationController.getOrganizations);
router.get("/:id", organizationController.getOrganization);
router.get("/batches/:batchId", organizationController.getOrganizationByBatchId);
router.post("/create", organizationController.createOrganization);
router.put("/:id", [isAdmin], organizationController.updateOrganization);
router.put("/:id/logo", [isAdmin], organizationController.updateOrganizationLogo);
router.delete("/:id/logo", [isAdmin], organizationController.removeOrganizationLogo);
router.delete("/:id", [isAdmin], organizationController.deleteOrganization);

// role
router.get("/:id/role", authMiddleware, organizationController.getOrganizationRole);

// department
router.get(
  "/:id/department",
  [isAdmin],
  organizationController.getOrganizationDepartments
);
router.get(
  "/:id/department/:departmentId",
  [isAdmin],
  organizationController.getOrganizationDepartment
);
router.post(
  "/:id/department/create",
  [isAdmin],
  organizationController.createOrganizationDepartment
);
router.put(
  "/:id/department/:departmentId",
  [isAdmin],
  organizationController.updateOrganizationDepartment
);
router.delete(
  "/:id/department/:departmentId",
  [isAdmin],
  organizationController.deleteOrganizationDepartment
);

// member
router.get(
  "/:id/member",
  [isAdmin],
  organizationController.getOrganizationMembers
);
// router.get(
//   "/:id/member/:memberId",
//   [isAdmin],
//   organizationController.getOrganizationMember
// );
router.post(
  "/:id/member/invite",
  [isAdmin],
  organizationController.inviteOrganizationMember
);
router.put(
  "/:id/membership-invitation/:roleId/respond",
  organizationController.respondToMembershipInvitation
);
router.put(
  "/:id/member/:memberId",
  [isAdmin],
  organizationController.updateOrganizationMember
);
router.delete(
  "/:id/member/:memberId",
  [isAdmin],
  organizationController.removeOrganizationMember
);

// application batch
router.get(
  "/:id/batches",
  authMiddleware,
  applicationController.getOrganizationBatches
);
router.get(
  "/:id/batches/:batchId",
  [isAdmin],
  applicationController.getOrganizationBatch
);
router.post(
  "/:id/batches/create",
  [isAdmin],
  applicationController.createOrganizationBatch
);
router.put(
  "/:id/batches/:batchId/archive",
  [isAdmin],
  applicationController.archiveOrganizationBatch
);

// applicant
router.get(
  "/:id/batches/:batchId/applicants",
  [isAdmin],
  applicationController.getApplicants
);
router.post(
  "/:id/batches/:batchId/applicants/invite",
  [isAdmin],
  applicationController.inviteApplicant
);
router.put(
  "/:id/application-invitation/:roleId/respond",
  applicationController.respondToApplicantInvitation
);
router.delete(
  "/:id/batches/:batchId/applicants/:applicantId",
  [isAdmin],
  applicationController.removeApplicant
);

// interview assignment
router.get(
  "/:id/batches/:batchId/applicants/:applicantId/interview-assignments",
  interviewController.getInterviewAssignmentsOfApplicant
);
router.post(
  "/:id/batches/:batchId/applicants/:applicantId/interview-assignments/",
  [isAdmin],
  interviewController.assignInterviews
)

router.get(
  "/:id/batches/:batchId/members/:memberId/interview-assignments",
  interviewController.getInterviewAssignmentsOfMember
);
router.get(
  "/:id/batches/:batchId/applicants/progress",
  authMiddleware,
  interviewController.getAllApplicantsProgress
);
router.get(
  "/:id/batches/:batchId/interview-appointments/calendar",
  interviewController.getMyCalendarAsMember
);
router.post(
  "/:id/batches/:batchId/interview-appointments/calendar/block",
  interviewController.blockTimeSlot
);
router.post(
  "/:id/batches/:batchId/interview-appointments/calendar/unblock",
  interviewController.unblockTimeSlot
);
module.exports = router;
