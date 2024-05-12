const axios = require("axios");

const socketUtil = require("../utils/socket");
const { hasConflict } = require("../utils/time");

const ApplicationEvaluation = require("../models/interview/evaluation");
const Batch = require("../models/interview/batch");
const User = require("../models/user");
const Role = require("../models/organization/role");
const Organization = require("../models/organization/organization");
const Notification = require("../models/notification");
const InterviewAssignment = require("../models/interview/interviewAssignment");
const InterviewAppointment = require("../models/interview/interviewAppointment");

const INTERVIEW_CONSTANTS = require("../constants/interview");

const getIndefiniteArticle = (word) => {
  const firstLetter = word.charAt(0).toLowerCase();
  if (["a", "e", "i", "o", "u"].includes(firstLetter)) {
    return "an";
  } else {
    return "a";
  }
};

// APPLICANT POV
exports.getApplications = async (req, res) => {
  try {
    const roles = await Role.find({
      userId: req.user._id,
      roles: { $in: ["applicant"] },
    })
      .populate("organizationId")
      .sort({ createdAt: -1 });

    return res.status(200).json(roles);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const role = await Role.findOne({
      userId: req.user._id,
      roles: { $in: ["applicant"] },
      organizationId: req.params.orgId,
      batch: req.query.batch,
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found." });
    }

    return res.status(200).json({ status: role.membershipStatus });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

exports.manageAppointment = async (req, res) => {
  try {
    const { action } = req.query;
    const { interviewAssignmentId } = req.params;

    const interviewAssignment = await InterviewAssignment.findOne({
      _id: interviewAssignmentId,
    });

    if (!interviewAssignment) {
      return res
        .status(404)
        .json({ message: "Interview assignment not found." });
    }

    const batch = await Batch.findById(interviewAssignment.batchId).populate(
      "organizationId"
    );
    const oldStatus = interviewAssignment.status;

    switch (action) {
      // must be an org applicant
      case "request":
        if (
          interviewAssignment.status ===
            INTERVIEW_CONSTANTS.STATUSES.unscheduled &&
          !interviewAssignment.appointment
        ) {
          const { dtStart, dtEnd } = req.body;

          const now = new Date();
          if (new Date(dtStart) < now) {
            return res.status(400).json({
              message: "Appointment cannot be scheduled in the past.",
            });
          }

          if (new Date(dtEnd) < new Date(dtStart)) {
            return res
              .status(400)
              .json({ message: "End time cannot be before start time." });
          }

          // check for blocked timeslot
          const blockedTimeSlots = await InterviewAssignment.find({
            batchId: interviewAssignment.batchId,
            interviewerId: interviewAssignment.interviewerId,
            status: "blocked",
          }).populate("appointment");

          for (const blockedTimeSlot of blockedTimeSlots) {
            if (
              hasConflict(
                {
                  start: new Date(blockedTimeSlot.appointment.dtStart),
                  end: new Date(blockedTimeSlot.appointment.dtEnd),
                },
                { start: new Date(dtStart), end: new Date(dtEnd) }
              )
            ) {
              return res.status(409).json({
                message:
                  "Cannot schedule appointment because time slot is blocked.",
              });
            }
          }

          const appointment = new InterviewAppointment({
            interviewAssignmentId,
            dtStart,
            dtEnd,
          });
          await appointment.save();

          interviewAssignment.appointment = appointment._id;
          interviewAssignment.status = INTERVIEW_CONSTANTS.STATUSES.requested;
          await interviewAssignment.save();

          // send notification to interviewer
          const batch = await Batch.findById(
            interviewAssignment.batchId
          ).populate("organizationId");
          await socketUtil.notify(req.io, {
            type: "appointment",
            receiver: interviewAssignment.interviewerId,
            message: `${req.user.firstName} ${req.user.lastName} has requested an interview appointment.`,
            context: {
              organization: batch.organizationId._id,
              sender: req.user._id,
              redirect: `/organizations/${batch.organizationId._id}?batch=${batch._id}&assignment=${interviewAssignment._id}`,
            },
          });

          socketUtil.updateAppointment(req.io, {
            receiver: interviewAssignment.interviewerId,
            action,
            batchId: batch._id,
          });

          return res.status(200).json({ message: "Appointment request sent." });
        } else {
          return res
            .status(400)
            .json({ message: "Appointment already requested." });
        }
        break;

      case "cancel":
        if (
          interviewAssignment.appointment &&
          ["requested", "scheduled"].includes(interviewAssignment.status)
        ) {
          await InterviewAppointment.deleteOne({
            _id: interviewAssignment.appointment,
          });

          interviewAssignment.appointment = null;
          interviewAssignment.status = INTERVIEW_CONSTANTS.STATUSES.unscheduled;
          await interviewAssignment.save();

          if (
            req.user._id.toString() ===
            interviewAssignment.interviewerId.toString()
          ) {
            // send notification to applicant
            await socketUtil.notify(req.io, {
              type: "appointment",
              receiver: interviewAssignment.applicantId,
              message: `${req.user.firstName} ${
                req.user.lastName
              } has cancelled your interview appointment${
                oldStatus === "requested" ? "request" : ""
              }.`,
              context: {
                organization: batch.organizationId._id,
                sender: req.user._id,
                redirect: `/applications/${batch.organizationId._id}?batch=${batch._id}&assignment=${interviewAssignment._id}`,
              },
            });

            socketUtil.updateAppointment(req.io, {
              receiver: interviewAssignment.applicantId,
              action,
            });
          } else {
            // send notification to interviewer
            await socketUtil.notify(req.io, {
              type: "appointment",
              receiver: interviewAssignment.interviewerId,
              message: `${req.user.firstName} ${
                req.user.lastName
              } has cancelled ${
                oldStatus === "requested" ? "their" : "your"
              } interview appointment${
                oldStatus === "requested" ? " request" : ""
              }.`,
              context: {
                organization: batch.organizationId._id,
                sender: req.user._id,
                redirect: `/organizations/${batch.organizationId._id}?batch=${batch._id}&assignment=${interviewAssignment._id}`,
              },
            });

            socketUtil.updateAppointment(req.io, {
              receiver: interviewAssignment.interviewerId,
              action,
              batchId: batch._id,
            });
          }

          return res
            .status(200)
            .json({ message: "Appointment cancelled successfully." });
        } else {
          return res.status(400).json({ message: "No appointment to cancel." });
        }
        break;

      // must be an org member
      case "accept":
        if (
          interviewAssignment.status === INTERVIEW_CONSTANTS.STATUSES.requested
        ) {
          interviewAssignment.status = INTERVIEW_CONSTANTS.STATUSES.scheduled;
          await interviewAssignment.save();

          // send notification to applicant
          await socketUtil.notify(req.io, {
            type: "appointment",
            receiver: interviewAssignment.applicantId,
            message: `${req.user.firstName} ${req.user.lastName} has accepted your interview appointment request.`,
            context: {
              organization: batch.organizationId._id,
              sender: req.user._id,
              redirect: `/applications/${batch.organizationId._id}?batch=${batch._id}&assignment=${interviewAssignment._id}`,
            },
          });

          socketUtil.updateAppointment(req.io, {
            receiver: interviewAssignment.applicantId,
            action,
          });

          return res
            .status(200)
            .json({ message: "Interview scheduled successfully." });
        } else {
          return res.status(400).json({
            message: "Only existing requested appointments can be scheduled.",
          });
        }
        break;

      case "decline":
        if (
          interviewAssignment.status === INTERVIEW_CONSTANTS.STATUSES.requested
        ) {
          await InterviewAppointment.deleteOne({
            _id: interviewAssignment.appointment,
          });

          interviewAssignment.status = INTERVIEW_CONSTANTS.STATUSES.unscheduled;
          interviewAssignment.appointment = null;
          await interviewAssignment.save();

          // send notification to applicant
          await socketUtil.notify(req.io, {
            type: "appointment",
            receiver: interviewAssignment.applicantId,
            message: `${req.user.firstName} ${req.user.lastName} has declined your interview appointment request.`,
            context: {
              organization: batch.organizationId._id,
              sender: req.user._id,
              redirect: `/applications/${batch.organizationId._id}?batch=${batch._id}&assignment=${interviewAssignment._id}`,
            },
          });

          socketUtil.updateAppointment(req.io, {
            receiver: interviewAssignment.applicantId,
            action,
          });

          return res
            .status(200)
            .json({ message: "Interview request have been declined." });
        } else {
          return res.status(400).json({
            message: "Only existing requested appointments can be declined.",
          });
        }
        break;

      case "mark-done":
        if (
          interviewAssignment.status === INTERVIEW_CONSTANTS.STATUSES.scheduled
        ) {
          interviewAssignment.status = INTERVIEW_CONSTANTS.STATUSES.done;
          await interviewAssignment.save();

          // send notification to applicant
          await socketUtil.notify(req.io, {
            type: "appointment",
            receiver: interviewAssignment.applicantId,
            message: `${req.user.firstName} ${req.user.lastName} has marked your interview appointment as done.`,
            context: {
              organization: batch.organizationId._id,
              sender: req.user._id,
              redirect: `/applications/${batch.organizationId._id}?batch=${batch._id}&assignment=${interviewAssignment._id}`,
            },
          });

          socketUtil.updateAppointment(req.io, {
            receiver: interviewAssignment.applicantId,
            action,
          });

          // ping officers and admins
          const officerAndAdminRoles = await Role.find({
            organizationId: batch.organizationId._id,
            roles: { $in: ["admin", "officer"] },
            userId: { $ne: req.user._id },
          }).select("userId");

          for (const execRoles of officerAndAdminRoles) {
            socketUtil.emitProgressUpdate(req.io, {
              receiver: execRoles.userId,
              batchId: batch._id,
            });
          }

          return res.status(200).json({ message: "Interview marked as done!" });
        } else {
          return res.status(400).json({
            message: "Only existing scheduled appointments can be marked done.",
          });
        }
        break;

      case "mark-scheduled":
        if (interviewAssignment.status === INTERVIEW_CONSTANTS.STATUSES.done) {
          interviewAssignment.status = INTERVIEW_CONSTANTS.STATUSES.scheduled;
          await interviewAssignment.save();

          // send notification to applicant
          await socketUtil.notify(req.io, {
            type: "appointment",
            receiver: interviewAssignment.applicantId,
            message: `${req.user.firstName} ${req.user.lastName} has reverted your interview appointment status to scheduled.`,
            context: {
              organization: batch.organizationId._id,
              sender: req.user._id,
              redirect: `/applications/${batch.organizationId._id}?batch=${batch._id}&assignment=${interviewAssignment._id}`,
            },
          });

          socketUtil.updateAppointment(req.io, {
            receiver: interviewAssignment.applicantId,
            action,
          });

          // ping officers and admins
          const officerAndAdminRoles = await Role.find({
            organizationId: batch.organizationId._id,
            roles: { $in: ["admin", "officer"] },
            userId: { $ne: req.user._id },
          }).select("userId");

          for (const execRoles of officerAndAdminRoles) {
            socketUtil.emitProgressUpdate(req.io, {
              receiver: execRoles.userId,
              batchId: batch._id,
            });
          }

          return res
            .status(200)
            .json({ message: "Interview reverted to scheduled." });
        } else {
          return res.status(400).json({
            message:
              "Only existing appointments marked as done can be reverted to scheduled status.",
          });
        }
        break;

      default:
        return res.status(400).json({ message: "Invalid action." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// returns the scheduled appointments of an interviewer + the requested appointment of the authenticated applicant
exports.getInterviewerCalendar = async (req, res) => {
  try {
    // the user must have be assigned to the interviewer before they can see the calendar
    const interviewAssignment = await InterviewAssignment.findOne({
      _id: req.params.interviewAssignmentId,
      applicantId: req.user._id,
    });

    if (!interviewAssignment) {
      return res
        .status(404)
        .json({ message: "Interview assignment not found." });
    }

    const { batchId, interviewerId } = interviewAssignment;

    const interviewerCalendar = [];

    const scheduledAndComplettedInterviews = await InterviewAssignment.find({
      batchId,
      interviewerId,
      status: { $in: ["scheduled", "done", "blocked"] },
    }).populate("appointment applicantId");

    for (const int of scheduledAndComplettedInterviews) {
      // add indicator to the appointment title if the user is the applicant
      let applicantAppointmentLabel = "";
      if (
        int.applicantId &&
        int.applicantId._id.toString() === req.user._id.toString()
      ) {
        applicantAppointmentLabel = ` - ${int.applicantId.firstName} ${int.applicantId.lastName} (me)`;
      }

      interviewerCalendar.push({
        id: int._id,
        title:
          int.status === "blocked"
            ? "Blocked Time Slot"
            : `Interview Appointment` + applicantAppointmentLabel,
        start: int.appointment.dtStart,
        end: int.appointment.dtEnd,
        status: int.status,
      });
    }

    const myRequestedInterview = await InterviewAssignment.findOne({
      batchId,
      interviewerId,
      applicantId: req.user._id,
      status: "requested",
    }).populate("appointment");

    if (myRequestedInterview) {
      interviewerCalendar.push({
        id: myRequestedInterview._id,
        title: "Requested Appointment (me)",
        start: myRequestedInterview.appointment.dtStart,
        end: myRequestedInterview.appointment.dtEnd,
        status: myRequestedInterview.status,
      });
    }

    return res.status(200).json(interviewerCalendar);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.getMyCalendarAsApplicant = async (req, res) => {
  try {
    const { batch } = req.query;

    const interviewAssignments = await InterviewAssignment.find({
      applicantId: req.user._id,
      batchId: batch,
      status: { $in: ["requested", "scheduled", "done"] },
    }).populate("appointment interviewerId");

    console.log({ interviewAssignments });

    const myCalendar = interviewAssignments.map((int) => {
      return {
        id: int._id,
        title: `${int.interviewerId.firstName} ${int.interviewerId.lastName}`,
        start: int.appointment.dtStart,
        end: int.appointment.dtEnd,
        status: int.status,
      };
    });

    return res.status(200).json(myCalendar);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Something went wrong." });
  }
};

// ORG MEMBER, ADMIN POV

// batches
exports.getOrganizationBatches = async (req, res) => {
  try {
    // get organization
    const org = await Organization.findById(req.params.id);
    // get membership date
    const role = await Role.findOne({
      roles: { $in: ["member", "admin", "officer"] },
      userId: req.user._id,
      organizationId: org._id,
    });
    // only fetch batches that are later than the membership date of the member
    const batches = await Batch.find({
      organizationId: req.params.id,
      createdAt: { $gt: role.createdAt },
    });
    return res.status(200).json(batches);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.getOrganizationBatch = async (req, res) => {
  try {
    const batch = await Batch.findOne({
      organizationId: req.params.id,
      _id: req.params.batchId,
    });
    return res.status(200).json(batch);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.createOrganizationBatch = async (req, res) => {
  const { name } = req.body;
  try {
    const exists = await Batch.findOne({
      name,
      organizationId: req.params.id,
    });

    if (exists) {
      return res.status(400).json({ message: "Batch already exists." });
    }

    const batch = new Batch({
      name,
      organizationId: req.params.id,
      archived: false,
    });
    await batch.save();

    return res.status(201).json(batch);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.archiveOrganizationBatch = async (req, res) => {
  const { name } = req.body;
  try {
    const exists = await Batch.findOne({
      organizationId: req.params.id,
      _id: req.params.batchId,
    });

    if (!exists) {
      return res.status(404).json({ message: "Batch does not exist." });
    }

    const batch = await Batch.findOneAndUpdate(
      { organizationId: req.params.id, _id: req.params.batchId },
      { archived: true },
      { new: true }
    );
    return res.status(200).json(batch);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
};

// applicants
exports.getApplicants = async (req, res) => {
  try {
    const batch = await Batch.findOne({
      organizationId: req.params.id,
      _id: req.params.batchId,
    });

    if (!batch) {
      return res.status(404).json({ message: "Batch does not exist." });
    }

    // get organization roles with the matching batch
    const roles = await Role.find({
      organizationId: req.params.id,
      batch: req.params.batchId,
      roles: { $in: ["applicant"] },
    }).populate("userId");

    return res.status(200).json(roles);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.inviteApplicant = async (req, res) => {
  const { email } = req.body;

  try {
    const batch = await Batch.findOne({
      _id: req.params.batchId,
      organizationId: req.params.id,
    });

    if (!batch) {
      return res.status(404).json({ message: "Batch does not exist." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User account does not exist." });
    }

    // already an applicant (invited/confirmed)
    let role = await Role.findOne({
      organizationId: req.params.id,
      batch: req.params.batchId,
      userId: user._id,
      roles: {
        $in: ["applicant"],
      },
    });

    if (role) {
      return res.status(400).json({
        message: `User is already ${getIndefiniteArticle(
          role.membershipStatus
        )} ${role.membershipStatus} applicant.`,
      });
    }

    // already a member (invited/confirmed)
    role = await Role.findOne({
      organizationId: req.params.id,
      userId: user._id,
      roles: {
        $in: ["member", "officer", "admin"],
      },
    });

    if (role) {
      return res.status(400).json({
        message: `User is already ${getIndefiniteArticle(
          role.membershipStatus
        )} ${role.membershipStatus} member of the organization.`,
      });
    }

    // new applicant
    role = new Role({
      organizationId: req.params.id,
      userId: user._id,
      roles: "applicant",
      membershipStatus: "invited",
      batch: req.params.batchId,
    });

    await role.populate("userId");
    await role.save();

    // create a notification
    await socketUtil.notify(req.io, {
      type: "invite:application",
      receiver: user._id,
      message: "You have been invited as an applicant to the organization.",
      context: {
        organization: req.params.id,
        role: role._id,
        sender: req.user._id,
      },
    });

    return res.status(201).json(role);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.respondToApplicantInvitation = async (req, res) => {
  let redirect = null;
  try {
    const role = await Role.findOne({
      _id: req.params.roleId,
      organizationId: req.params.id,
      userId: req.user._id,
    });

    if (!role) {
      return res.status(404).json({
        message: "You are not invited as an applicant to this organization.",
      });
    }

    const action = req.query.action;

    if (action === "accept") {
      role.membershipStatus = "confirmed";
      await role.save();

      redirect = `/applications/${req.params.id}?batch=${role.batch}`;
    } else if (action === "decline") {
      await Role.deleteOne({
        _id: req.params.roleId,
      });
    }

    // archive associated notification
    const notif = await Notification.findOne({
      type: "invite:application",
      receiver: req.user._id,
      "context.organization": req.params.id,
      "context.role": role._id,
    });

    if (notif) {
      notif.archived = true;
      notif.read = true;
      await notif.save();
    }

    // notify the admins
    const adminRoles = await Role.find({
      organizationId: req.params.id,
      roles: { $in: ["admin"] },
      userId: { $ne: req.user._id },
    });

    const actionPastTense = action === "accept" ? "accepted" : "declined";

    for (const adminRole of adminRoles) {
      // create notification for each admin
      await socketUtil.notify(req.io, {
        type: "invite-response:application",
        receiver: adminRole.userId,
        message: `${req.user.firstName} ${req.user.lastName} has ${actionPastTense} your application invitation to the organization.`,
        context: {
          organization: req.params.id,
          sender: req.user._id,
          redirect: `/organizations/${req.params.id}/manage/applicants`,
        },
      });
    }

    return res.status(200).json({ redirect });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.removeApplicant = async (req, res) => {
  try {
    const role = await Role.findOneAndDelete({
      organizationId: req.params.id,
      userId: req.params.applicantId,
      batch: req.params.batchId,
      $or: [{ membershipStatus: "invited" }, { membershipStatus: "confirmed" }],
      roles: "applicant",
    });

    if (!role) {
      return res
        .status(404)
        .json({ message: "User is not an applicant in this batch." });
    }

    // remove interview assignments
    await InterviewAssignment.deleteMany({
      batchId: req.params.batchId,
      applicantId: req.params.applicantId,
    });

    // archive notifications
    const notif = await Notification.findOne({
      type: "invite:application",
      receiver: req.params.applicantId,
    });
    if (notif) {
      notif.archived = true;
      await notif.save();
    }

    return res.status(200).json(role);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.evaluateApplicants = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { accepted, rejected } = req.body;

    const batch = await Batch.findOne({
      _id: batchId,
    });
    if (!batch) {
      return res.status(404).json({ message: "Batch does not exist." });
    }

    const organization = await Organization.findOne({
      _id: batch.organizationId,
    });
    if (!organization) {
      return res.status(404).json({ message: "Organization does not exist." });
    }

    const hasAdminRole = await Role.findOne({
      organizationId: organization._id,
      userId: req.user._id,
      roles: { $in: ["admin"] },
    });
    if (!hasAdminRole) {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action." });
    }

    const roles = await Role.find({
      organizationId: organization._id,
      batch: batch._id,
      roles: "applicant",
      userId: { $in: [...accepted, ...rejected] },
    });

    for (const role of roles) {
      if (accepted.includes(role.userId.toString())) {
        role.membershipStatus = "accepted";
      } else if (rejected.includes(role.userId.toString())) {
        role.membershipStatus = "rejected";
      }

      await role.save();
    }

    const applicationEvaluation = new ApplicationEvaluation({
      batch: batchId,
      evaluator: req.user._id,
      applicants: {
        accepted,
        rejected,
      },
    });

    await applicationEvaluation.save();

    return res.status(200).json(applicationEvaluation);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.getApplicationEvaluation = async (req, res) => {
  try {
    const { batchId } = req.params;

    // check if the authenticated user has the admin role for that organization
    const batch = await Batch.findOne({
      _id: batchId,
    });
    if (!batch) {
      return res.status(404).json({ message: "Batch does not exist." });
    }

    const organization = await Organization.findOne({
      _id: batch.organizationId,
    });
    if (!organization) {
      return res.status(404).json({ message: "Organization does not exist." });
    }

    const hasAdminRole = await Role.findOne({
      organizationId: organization._id,
      userId: req.user._id,
      roles: { $in: ["admin", "officer", "member"] },
    });
    if (!hasAdminRole) {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action." });
    }

    const applicationEvaluation = await ApplicationEvaluation.findOne({
      batch: batchId,
    });
    if (!applicationEvaluation) {
      return res
        .status(404)
        .json({ message: "Application evaluation does not exist." });
    }

    return res.status(200).json(applicationEvaluation);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.updateApplicationEvaluation = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { accepted, rejected } = req.body;

    const batch = await Batch.findOne({
      _id: batchId,
    });
    if (!batch) {
      return res.status(404).json({ message: "Batch does not exist." });
    }

    const organization = await Organization.findOne({
      _id: batch.organizationId,
    });
    if (!organization) {
      return res.status(404).json({ message: "Organization does not exist." });
    }

    const hasAdminRole = await Role.findOne({
      organizationId: organization._id,
      userId: req.user._id,
      roles: { $in: ["admin"] },
    });
    if (!hasAdminRole) {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action." });
    }

    const applicationEvaluation = await ApplicationEvaluation.findOne({
      batch: batchId,
    });
    if (!applicationEvaluation) {
      return res
        .status(404)
        .json({ message: "Application evaluation does not exist." });
    }

    if (applicationEvaluation.transmitted) {
      return res.status(400).json({
        message: "Application evaluation has already been submitted.",
      });
    }

    applicationEvaluation.evaluator = req.user._id;
    applicationEvaluation.applicants = {
      accepted,
      rejected,
    };
    await applicationEvaluation.save();

    const roles = await Role.find({
      organizationId: organization._id,
      batch: batch._id,
      roles: "applicant",
      userId: { $in: [...accepted, ...rejected] },
    });

    for (const role of roles) {
      if (accepted.includes(role.userId.toString())) {
        role.membershipStatus = "accepted";
      } else if (rejected.includes(role.userId.toString())) {
        role.membershipStatus = "rejected";
      }
      await role.save();
    }

    return res.status(200).json(applicationEvaluation);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Something went wrong." });
  }
};

// successful application transmission
exports.transmitApplicationResults = async (req, res) => {
  try {
    const { batchId } = req.params;

    // check if the authenticated user has the admin role for that organization
    const batch = await Batch.findOne({
      _id: batchId,
    });
    if (!batch) {
      return res.status(404).json({ message: "Batch does not exist." });
    }

    const organization = await Organization.findOne({
      _id: batch.organizationId,
    });
    if (!organization) {
      return res.status(404).json({ message: "Organization does not exist." });
    }

    const hasAdminRole = await Role.findOne({
      organizationId: organization._id,
      userId: req.user._id,
      roles: { $in: ["admin"] },
    });
    if (!hasAdminRole) {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action." });
    }

    const applicationEvaluation = await ApplicationEvaluation.findOne({
      batch: batchId,
    }).populate("applicants.accepted");
    if (!applicationEvaluation) {
      return res
        .status(404)
        .json({ message: "Application evaluation does not exist." });
    }

    if (applicationEvaluation.applicants.accepted.length === 0) {
      applicationEvaluation.transmissionDate = new Date(Date.now());
      await applicationEvaluation.save();

      return res.status(200).json({
        message:
          "Application results have been finalized. No data was transmitted to OSAM.",
      });
    }

    const userEmails = applicationEvaluation.applicants.accepted.map(
      (user) => user.email
    );
    // transmit to "OSAM System"

    const osamRes = await axios({
      url: `${process.env.OSAM_API_URL}/organizations/${batch.organizationId}/roster/add`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OSAM_API_KEY}`,
      },
      data: {
        users: userEmails,
      },
    });

    if (osamRes.status === 201) {
      const membershipDate = new Date(Date.now());
      applicationEvaluation.transmissionDate = membershipDate;
      await applicationEvaluation.save();

      // add membership roles to the users
      for (const user of applicationEvaluation.applicants.accepted) {
        const role = new Role({
          batch: batch._id,
          organizationId: batch.organizationId,
          userId: user._id,
          roles: ["member"],
          membershipStatus: "active",
          memberSince: membershipDate,
        });
        await role.save();
      }

      // archive batch
      batch.archived = true;
      await batch.save();
    } else {
      throw Error();
    }

    return res.status(200).json(userEmails);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Something went wrong." });
  }
};
