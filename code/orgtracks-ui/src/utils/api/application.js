import axios from "@/utils/axios";

const getAll = async () => {
  try {
    const { data } = await axios.get("/applications", {
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    return null;
  }
};

const getStatus = async (orgId, batchId) => {
  try {
    const { data } = await axios.get(
      `/applications/${orgId}/status?batch=${batchId}`,
      {
        headers: {
          withAuth: true,
        },
      }
    );
    return data;
  } catch (err) {
    return null;
  }
}

const manageInterviewAppointment = async (
  interviewAssignmentId,
  action,
  payload
) => {
  try {
    const { data } = await axios({
      url: `/applications/interview-assignments/${interviewAssignmentId}?action=${action}`,
      method: "post",
      data: payload,
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    return null;
  }
};

const requestInterviewAppointment = async (interviewAssignmentId, payload) => {
  const result = await manageInterviewAppointment(
    interviewAssignmentId,
    "request",
    payload
  );
  return result;
};

const cancelInterviewAppointment = async (interviewAssignmentId) => {
  const result = await manageInterviewAppointment(
    interviewAssignmentId,
    "cancel",
    {}
  );
  return result;
};

const acceptInterviewAppointment = async (interviewAssignmentId) => {
  const result = await manageInterviewAppointment(
    interviewAssignmentId,
    "accept",
    {}
  );
  return result;
};

const declineInterviewAppointment = async (interviewAssignmentId) => {
  const result = await manageInterviewAppointment(
    interviewAssignmentId,
    "decline",
    {}
  );
  return result;
};

const markDoneInterviewAppointment = async (interviewAssignmentId) => {
  const result = await manageInterviewAppointment(
    interviewAssignmentId,
    "mark-done",
    {}
  );
  return result;
};

const markScheduledInterviewAppointment = async (interviewAssignmentId) => {
  const result = await manageInterviewAppointment(
    interviewAssignmentId,
    "mark-scheduled",
    {}
  );
  return result;
};

const getInterviewerCalendar = async (interviewAssignmentId) => {
  try {
    const { data } = await axios({
      url: `/applications/interview-assignments/${interviewAssignmentId}/calendar`,
      method: "get",
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    return null;
  }
};

const getMyCalendarAsApplicant = async (batchId) => {
  try {
    const { data } = await axios({
      url: `/applications/interview-appointments/calendar?batch=${batchId}`,
      method: "get",
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    return null;
  }
};

const getAllFeedback = async (interviewAssignmentId) => {
  try {
    const { data } = await axios({
      url: `/applications/interview-assignments/${interviewAssignmentId}/feedback`,
      method: "get",
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    return null;
  }
};

const addFeedback = async (interviewAssignmentId, payload) => {
  try {
    const { data } = await axios({
      url: `/applications/interview-assignments/${interviewAssignmentId}/feedback`,
      method: "post",
      data: payload,
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    return null;
  }
};

const updateFeedback = async (interviewAssignmentId, feedbackId, payload) => {
  try {
    const { data } = await axios({
      url: `/applications/interview-assignments/${interviewAssignmentId}/feedback/${feedbackId}`,
      method: "put",
      data: payload,
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    return null;
  }
};

const removeFeedback = async (interviewAssignmentId, feedbackId) => {
  try {
    const { data } = await axios({
      url: `/applications/interview-assignments/${interviewAssignmentId}/feedback/${feedbackId}`,
      method: "delete",
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    return null;
  }
};

// evaluation

const evaluateApplicants = async (batchId, payload) => {
  try {
    const { data } = await axios({
      url: `/applications/batches/${batchId}/evaluation`,
      method: "post",
      data: payload,
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    return null;
  }
};

const getApplicationEvaluation = async (batchId) => {
  try {
    const { data } = await axios({
      url: `/applications/batches/${batchId}/evaluation`,
      method: "get",
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    return null;
  }
};

const updateEvaluation = async (batchId, evaluationId, payload) => {
  try {
    const { data } = await axios({
      url: `/applications/batches/${batchId}/evaluation/${evaluationId}`,
      method: "put",
      data: payload,
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    return null;
  }
};

const submitToOSAM = async (batchId) => {
  try {
    const { data } = await axios({
      url: `/applications/batches/${batchId}/evaluation/transmit`,
      method: "post",
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    return null;
  }
};

export default {
  getStatus,
  getAll,

  // interview appointments
  requestInterviewAppointment,
  cancelInterviewAppointment,
  acceptInterviewAppointment,
  declineInterviewAppointment,
  markDoneInterviewAppointment,
  markScheduledInterviewAppointment,
  getInterviewerCalendar,
  getMyCalendarAsApplicant,

  // feedback
  getAllFeedback,
  addFeedback,
  updateFeedback,
  removeFeedback,

  // evaluation
  evaluateApplicants,
  getApplicationEvaluation,
  updateEvaluation,
  submitToOSAM
};
