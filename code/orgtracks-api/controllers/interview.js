const mongoose = require("mongoose");

const socketUtil = require("../utils/socket");
const stringUtil = require("../utils/string");
const { hasConflict } = require("../utils/time");

const InterviewAssignment = require("../models/interview/interviewAssignment");
const InterviewAppointment = require("../models/interview/interviewAppointment");
const InterviewerFeedback = require("../models/interview/interviewerFeedback");
const Role = require("../models/organization/role");
const Batch = require("../models/interview/batch");

const FEEDBACK_CONSTANTS = require("../constants/feedback");

// get the interview progress based on the interview assignments of all applicants in a batch
async function getAllApplicantProgress(batchId) {
  const applicantsProgress = await InterviewAssignment.aggregate([
    {
      $match: {
        batchId: new mongoose.Types.ObjectId(batchId),
        status: {
          $nin: ["hidden", "blocked"],
        },
      },
    },
    {
      $group: {
        _id: {
          batchId: "$batchId",
          applicantId: "$applicantId",
        },
        total: {
          $sum: 1,
        },
        done: {
          $sum: {
            $cond: {
              if: { $eq: ["$status", "done"] },
              then: 1,
              else: 0,
            },
          },
        },
      },
    },
  ]);

  return applicantsProgress;
}

// get interview assignments of an applicant
exports.getInterviewAssignmentsOfApplicant = async (req, res) => {
  const { id, batchId, applicantId } = req.params;

  try {
    // authenticated user has
    const adminRole = await Role.findOne({
      userId: req.user._id,
      organizationId: id,
      roles: {
        $in: ["admin"],
      },
    });
    // or
    const applicantRole = await Role.findOne({
      userId: req.user._id,
      organizationId: id,
      batch: batchId,
      roles: {
        $in: ["applicant"],
      },
    });

    if (
      !(
        adminRole ||
        (applicantRole && applicantRole.userId.toString() === applicantId)
      )
    ) {
      return res
        .status(403)
        .json({ message: "You do not have an access to this resource." });
    }

    const assignments = await InterviewAssignment.find({
      batchId,
      applicantId,
      status: {
        $ne: "hidden",
      },
    }).populate("interviewerId appointment");

    return res.status(200).json(assignments);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Something went wrong." });
  }
};

// get interview assignments of a member
exports.getInterviewAssignmentsOfMember = async (req, res) => {
  const { id, batchId, memberId } = req.params;
  try {
    // authenticated user has
    const adminRole = await Role.findOne({
      userId: req.user._id,
      organizationId: id,
      roles: {
        $in: ["admin"],
      },
    });
    // or
    const memberRole = await Role.findOne({
      userId: req.user._id,
      organizationId: id,
      roles: {
        $in: ["member", "officer"],
      },
    });
    if (
      !(adminRole || (memberRole && memberRole.userId.toString() === memberId))
    ) {
      return res
        .status(403)
        .json({ message: "You do not have an access to this resource." });
    }
    const assignments = await InterviewAssignment.find({
      batchId,
      interviewerId: memberId,
      status: {
        $nin: ["hidden", "blocked"],
      },
    }).populate(["applicantId"]);

    // populate interview appointment and progress
    const applicantsProgress = await getAllApplicantProgress(batchId);
    const assignmentsWithProgress = [];
    for (let assignment of assignments) {
      assignment = assignment.toObject();

      // retrieve appointment
      assignment.appointment = await InterviewAppointment.findById(
        assignment.appointment
      );
      // retrieve progress
      assignment.progress = applicantsProgress.find(
        (a) =>
          a._id.applicantId.toString() === assignment.applicantId._id.toString()
      );

      assignmentsWithProgress.push(assignment);
    }

    return res.status(200).json(assignmentsWithProgress);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Something went wrong." });
  }
};

// get all applicants identified by batch + interview progress
exports.getAllApplicantsProgress = async (req, res) => {
  const { id, batchId } = req.params;

  try {
    // authenticated user has
    const adminRole = await Role.findOne({
      userId: req.user._id,
      organizationId: id,
      roles: {
        $in: ["admin"],
      },
    });
    // or
    const memberRole = await Role.findOne({
      userId: req.user._id,
      organizationId: id,
      roles: {
        $in: ["member", "officer"],
      },
    });
    if (!(adminRole || memberRole)) {
      return res
        .status(403)
        .json({ message: "You do not have an access to this resource." });
    }

    // get all applicants
    const applicants = await Role.find({
      organizationId: id,
      batch: batchId,
      roles: {
        $in: ["applicant"],
      },
    }).populate("userId");

    // get progress
    const applicantsProgress = await getAllApplicantProgress(batchId);

    // populate progress
    const applicantsWithProgress = [];
    for (let applicant of applicants) {
      applicant = applicant.toObject();
      applicant.progress = applicantsProgress.find(
        (a) => a._id.applicantId.toString() === applicant.userId._id.toString()
      );
      applicantsWithProgress.push(applicant);
    }

    return res.status(200).json(applicantsWithProgress);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.assignInterviews = async (req, res) => {
  const { id, batchId, applicantId } = req.params;
  const { memberIds } = req.body;

  try {
    // disable all existing assignments first
    await InterviewAssignment.updateMany(
      { batchId, applicantId },
      { $set: { status: "hidden" } },
      { new: true }
    );

    // assign interview of the applicant with the selected members
    const assignments = [];
    for (const mId of memberIds) {
      let assignment = await InterviewAssignment.findOne({
        batchId,
        applicantId,
        interviewerId: mId,
      });

      if (!assignment) {
        assignment = new InterviewAssignment({
          batchId,
          applicantId,
          interviewerId: mId,
        });
      } else {
        assignment.status = "unscheduled";
      }

      await assignment.save();
      assignments.push(assignment);
    }

    return res.status(200).json(assignments);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.getMyCalendarAsMember = async (req, res) => {
  try {
    const { batchId } = req.params;

    const interviewAssignments = await InterviewAssignment.find({
      interviewerId: req.user._id,
      batchId,
      status: {
        $nin: ["unscheduled"],
      },
    }).populate("appointment applicantId");

    const myCalendar = interviewAssignments.map((int) => {
      return {
        id: int._id,
        title:
          int.status === "blocked"
            ? "Blocked Time Slot"
            : `${int.applicantId.firstName} ${int.applicantId.lastName}`,
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

exports.blockTimeSlot = async (req, res) => {
  const { batchId } = req.params;
  const { dtStart, dtEnd } = req.body;

  try {
    const interviewAssignments = await InterviewAssignment.find({
      batchId,
      interviewerId: req.user._id,
      status: {
        $in: ["scheduled", "blocked"],
      },
    }).populate("appointment");

    // check for conflict
    for (const interview of interviewAssignments) {
      const sched1 = {
        start: new Date(interview.appointment.dtStart),
        end: new Date(interview.appointment.dtEnd),
      };
      const sched2 = {
        start: new Date(dtStart),
        end: new Date(dtEnd),
      };

      if (hasConflict(sched1, sched2)) {
        return res.status(409).json({
          message:
            "Time slot is in conflict with a blocked time slot or a scheduled interview.",
        });
      }
    }

    // block time slot
    const blockedInterviewAssignment = new InterviewAssignment({
      batchId,
      interviewerId: req.user._id,
      status: "blocked",
    });
    await blockedInterviewAssignment.save();

    const blockedInterviewAppointment = new InterviewAppointment({
      interviewAssignmentId: blockedInterviewAssignment._id,
      dtStart,
      dtEnd,
    });
    await blockedInterviewAppointment.save();

    blockedInterviewAssignment.appointment = blockedInterviewAppointment._id;
    await blockedInterviewAssignment.save();

    return res.status(200).json(blockedInterviewAssignment);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.unblockTimeSlot = async (req, res) => {
  const { batchId } = req.params;
  const { interviewAssignmentId } = req.body;

  try {
    const interviewAssignment = await InterviewAssignment.findOne({
      _id: interviewAssignmentId,
      batchId,
      interviewerId: req.user._id,
      status: "blocked",
    }).populate("appointment");

    if (!interviewAssignment) {
      return res.status(404).json({ message: "Blocked time slot not found." });
    }

    await InterviewAppointment.deleteOne({
      interviewAssignmentId: interviewAssignmentId,
    });
    await InterviewAssignment.deleteOne({
      _id: interviewAssignmentId,
    });

    return res.status(200).json({ message: "Time slot unblocked." });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Something went wrong." });
  }
};

// feedback

exports.getAllFeedback = async (req, res) => {
  const { interviewAssignmentId } = req.params;

  try {
    const interviewAssignment = await InterviewAssignment.findById(
      interviewAssignmentId
    );

    if (!interviewAssignment) {
      return res
        .status(404)
        .json({ message: "Interview assignment not found." });
    }

    let role = "";
    const userId = req.user._id.toString();
    const interviewerId = interviewAssignment.interviewerId.toString();
    const applicantId = interviewAssignment.applicantId.toString();
    const batchId = interviewAssignment.batchId.toString();

    if (userId == interviewerId) {
      role = "interviewer";
    } else if (userId == applicantId) {
      role = "applicant";
    } else {
      return res
        .status(403)
        .json({ message: "You do not have an access to this resource??." });
    }

    let allFeedback = null;

    if (role === "interviewer") {
      allFeedback = await InterviewerFeedback.find({
        batch: batchId,
        applicant: applicantId,
      }).populate("interviewer applicant");
    } else if (role === "applicant") {
      allFeedback = await InterviewerFeedback.find({
        batch: batchId,
        interviewer: interviewerId,
        applicant: applicantId,
        visibility: FEEDBACK_CONSTANTS.VISIBILITY.ORG_AND_APPLICANT,
      }).populate("interviewer applicant");
    }

    return res.status(200).json(allFeedback);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.addFeedback = async (req, res) => {
  const { interviewAssignmentId } = req.params;
  const { visibility, content } = req.body;

  try {
    const interviewAssignment = await InterviewAssignment.findById(
      interviewAssignmentId
    );

    if (!interviewAssignment) {
      return res
        .status(404)
        .json({ message: "Interview assignment not found." });
    }

    if (
      interviewAssignment.interviewerId.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "You do not have an access to this resource." });
    }

    const { batchId, applicantId, interviewerId } = interviewAssignment;

    const interviewerFeedback = new InterviewerFeedback({
      batch: batchId,
      applicant: applicantId,
      interviewer: interviewerId,
      visibility,
      content,
    });

    await interviewerFeedback.save();
    await interviewerFeedback.populate("interviewer applicant");

    const batch = await Batch.findById(batchId);
    // send notification to applicant
    if (visibility === FEEDBACK_CONSTANTS.VISIBILITY.ORG_AND_APPLICANT) {
      await socketUtil.notify(req.io, {
        type: "interviewer-feedback",
        receiver: applicantId,
        message: `Wrote: "${stringUtil.clamp(content, 50)}"`,
        context: {
          organization: batch.organizationId._id,
          sender: req.user._id,
          redirect: `/applications/${batch.organizationId._id}?batch=${batch._id}&assignment=${interviewAssignment._id}`,
        },
      });

      // emit feedback update to applicant
      socketUtil.emitFeedback(req.io, {
        receiver: applicantId,
        interviewerFeedback,
      });
    }

    // emit feedback update to other members
    const orgMembers = await Role.find({
      organizationId: batch.organizationId._id,
      roles: { $in: ["member", "officer", "admin"] },
      userId: { $ne: req.user._id },
      memberSince: { $lt: batch.createdAt },
    }).select("userId");

    for (const member of orgMembers) {
      socketUtil.emitFeedback(req.io, {
        receiver: member.userId,
        interviewerFeedback,
      });
    }

    return res.status(200).json(interviewerFeedback);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.updateFeedback = async (req, res) => {
  const { interviewAssignmentId, feedbackId } = req.params;
  const { visibility, content } = req.body;

  try {
    const interviewAssignment = await InterviewAssignment.findById(
      interviewAssignmentId
    );

    if (!interviewAssignment) {
      return res
        .status(404)
        .json({ message: "Interview assignment not found." });
    }

    if (
      interviewAssignment.interviewerId.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "You do not have an access to this resource." });
    }

    const interviewerFeedback = await InterviewerFeedback.findById(
      feedbackId
    ).populate("applicant");

    if (!interviewerFeedback) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    if (visibility) interviewerFeedback.visibility = visibility;
    if (content) interviewerFeedback.content = content;

    await interviewerFeedback.save();

    const batch = await Batch.findById(interviewAssignment.batchId);
    // send notification to applicant
    if (visibility === FEEDBACK_CONSTANTS.VISIBILITY.ORG_AND_APPLICANT) {
      await socketUtil.notify(req.io, {
        type: "interviewer-feedback",
        receiver: interviewAssignment.applicantId,
        message: `${req.user.firstName} ${
          req.user.lastName
        } (updated): "${stringUtil.clamp(content, 50)}"`,
        context: {
          organization: batch.organizationId._id,
          sender: req.user._id,
          redirect: `/applications/${batch.organizationId._id}?batch=${batch._id}&assignment=${interviewAssignment._id}`,
        },
      });

      // emit feedback update to applicant
      socketUtil.emitFeedback(req.io, {
        receiver: interviewAssignment.applicantId,
        interviewerFeedback,
      });
    }

    // emit feedback update to other members
    const orgMembers = await Role.find({
      organizationId: batch.organizationId._id,
      roles: { $in: ["member", "officer", "admin"] },
      userId: { $ne: req.user._id },
      memberSince: { $lt: batch.createdAt },
    }).select("userId");

    for (const member of orgMembers) {
      socketUtil.emitFeedback(req.io, {
        receiver: member.userId,
        interviewerFeedback,
      });
    }

    return res.status(200).json(interviewerFeedback);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.removeFeedback = async (req, res) => {
  const { interviewAssignmentId, feedbackId } = req.params;

  try {
    const interviewAssignment = await InterviewAssignment.findById(
      interviewAssignmentId
    );

    if (!interviewAssignment) {
      return res
        .status(404)
        .json({ message: "Interview assignment not found." });
    }

    if (
      interviewAssignment.interviewerId.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "You do not have an access to this resource." });
    }

    const interviewerFeedback = await InterviewerFeedback.findById(feedbackId);

    if (!interviewerFeedback) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    const deletedInterviewerFeedback =
      await InterviewerFeedback.findByIdAndDelete(feedbackId).populate(
        "applicant"
      );

    const batch = await Batch.findById(interviewAssignment.batchId);

    // emit feedback update to applicant
    socketUtil.emitFeedback(req.io, {
      receiver: interviewAssignment.applicantId,
      interviewerFeedback,
    });

    // emit feedback update to other members
    const orgMembers = await Role.find({
      organizationId: batch.organizationId._id,
      roles: { $in: ["member", "officer", "admin"] },
      userId: { $ne: req.user._id },
      memberSince: { $lt: batch.createdAt },
    }).select("userId");

    for (const member of orgMembers) {
      socketUtil.emitFeedback(req.io, {
        receiver: member.userId,
        interviewerFeedback: deletedInterviewerFeedback,
      });
    }

    return res.status(200).json({ message: "Feedback removed." });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Something went wrong." });
  }
};
