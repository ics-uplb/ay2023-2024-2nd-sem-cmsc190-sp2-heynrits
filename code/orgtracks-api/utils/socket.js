const Notification = require("../models/notification");

const notify = async (io, { type, receiver, message, context }) => {
  const notification = new Notification({
    type,
    receiver,
    message,
    context,
  });
  await notification.save();

  io.to(receiver.toString()).emit("notification", notification);
};

const updateAppointment = async (io, { receiver, action, batchId }) => {
  io.to(receiver.toString()).emit("appointment", {
    action,
    batchId,
  });
};

const emitFeedback = async (io, { receiver, interviewerFeedback }) => {
  io.to(receiver.toString()).emit("interviewer-feedback", interviewerFeedback);
};

const emitProgressUpdate = async (io, { receiver, batchId }) => {
  io.to(receiver.toString()).emit("progress-update", batchId);
};

module.exports = {
  notify,
  updateAppointment,
  emitFeedback,
  emitProgressUpdate,
};
