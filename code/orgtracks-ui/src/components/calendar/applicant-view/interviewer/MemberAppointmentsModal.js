import { forwardRef, useState, useEffect, useContext } from "react";
import dayjs from "dayjs";

import application from "@/utils/api/application";

import { SystemFeedbackContext } from "@/context/SystemFeedbackContext";
import { SocketContext } from "@/context/SocketContext";

import { BiCalendarX, BiComment, BiUser } from "react-icons/bi";

import AppointmentDetails from "./AppointmentDetails";
import RequestedSlotDetails from "./RequestedSlotDetails";
import InterviewerCalendar from "./InterviewerCalendar";

const InterviewerFeedback = ({ loading, interviewerFeedback }) => {
  return (
    <div
      className={` flex items-start gap-4 hover:bg-gray-100 py-2 rounded-md`}
    >
      {loading ? (
        <>
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 skeleton"></div>
          <div className="flex-1">
            <div className="w-32 h-4 mb-2 skeleton"></div>
            <div className="w-96 h-4 mb-1 skeleton"></div>
            <div className="w-96 h-4 skeleton"></div>
          </div>
        </>
      ) : (
        <>
          {interviewerFeedback.interviewer.avatar ? (
            <img
              src={interviewerFeedback.interviewer.avatar}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200">
              <BiUser size="1.25em" />
            </div>
          )}
          <div className="flex-1">
            <p className="font-bold text-xs flex flex-col gap-1">
              <span>
                {interviewerFeedback.interviewer.firstName}{" "}
                {interviewerFeedback.interviewer.lastName}
              </span>
              <span className="text-xs text-gray-400 font-normal flex gap-1">
                {dayjs(interviewerFeedback.updatedAt).format(
                  "MMM D, YYYY [at] h:mm a"
                )}{" "}
                {interviewerFeedback.createdAt !==
                  interviewerFeedback.updatedAt && "(edited)"}
              </span>
            </p>
            <pre className="font-sans text-xs mt-1.5">
              {interviewerFeedback.content}
            </pre>
          </div>
        </>
      )}
    </div>
  );
};

const MemberAppointmentsModal = forwardRef(
  ({ editable, open, setOpen, interviewAssignment, onUpdate }, ref) => {
    const { socket } = useContext(SocketContext);
    const { interviewerId: interviewer } = interviewAssignment || {};

    const { showMessage } = useContext(SystemFeedbackContext);

    const [events, setEvents] = useState([]); // appointments + newEvent
    const [appointments, setAppointments] = useState(false);
    const [loadingCalendar, setLoadingCalendar] = useState(true);

    const [requestingAppointment, setRequestingAppointment] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [newEvent, setNewEvent] = useState(null);

    const [isAppointmentCancelled, setIsAppointmentCancelled] = useState(false);
    const [cancellingAppointmentTimeoutId, setCancellingAppointmentTimeoutId] =
      useState(null);

    const [interviewerNotes, setInterviewerNotes] = useState(null);
    const [notesLoading, setNotesLoading] = useState(true);

    const requestAppointment = async () => {
      const res = await application.requestInterviewAppointment(
        interviewAssignment._id,
        {
          dtStart: newEvent.start,
          dtEnd: newEvent.end,
        }
      );
      if (res === null) {
        showMessage({
          type: "error",
          message: "There was an error requesting the interview.",
        });
        return;
      } else {
        showMessage({
          type: "success",
          message: res.message,
        });
        getAppointments(interviewAssignment);
        onUpdate();
      }

      setRequestingAppointment(false);
      setNewEvent(null);
    };

    const handleCancelAppointment = async () => {
      setIsAppointmentCancelled(true);
      const timeoutId = setTimeout(() => {
        cancelAppointment();
      }, 5000);

      setCancellingAppointmentTimeoutId(timeoutId);
    };

    const cancelAppointment = async () => {
      const res = await application.cancelInterviewAppointment(
        interviewAssignment._id
      );

      if (res === null) {
        showMessage({
          type: "error",
          message: "There was an error canceling the interview.",
        });
        return;
      } else {
        showMessage({
          type: "success",
          message: res.message,
        });

        getAppointments(interviewAssignment);
        onUpdate();
      }

      setIsAppointmentCancelled(false);
      setCancellingAppointmentTimeoutId(null);
    };

    const undoCancelAppointment = () => {
      clearTimeout(cancellingAppointmentTimeoutId);
      setIsAppointmentCancelled(false);
      setCancellingAppointmentTimeoutId(null);
    };

    useEffect(() => {
      if (newEvent) {
        setEvents([...(appointments || []), newEvent]);
      } else {
        setEvents([...(appointments || [])]);
      }
    }, [newEvent, appointments]);

    async function getAppointments(interviewAssignment) {
      if (!interviewAssignment) return;

      const data = await application.getInterviewerCalendar(
        interviewAssignment._id
      );
      if (!data || data.message) {
        showMessage({
          type: "error",
          message:
            data.message ||
            "There was an error while fetching the interview appointments.",
        });
        return;
      }
      setAppointments(data);
    }

    const getInterviewerNotes = async (interviewAssignment) => {
      if (!interviewAssignment) return;

      setNotesLoading(true);
      const data = await application.getAllFeedback(interviewAssignment._id);
      setNotesLoading(false);

      if (!data) {
        showMessage({
          type: "error",
          message: "There was an error while fetching the interview feedback.",
        });
        return;
      }
      setInterviewerNotes(data);
    };

    useEffect(() => {
      getAppointments(interviewAssignment);
      getInterviewerNotes(interviewAssignment);
    }, [interviewAssignment]);

    useEffect(() => {
      if (socket) {
        socket.on("interviewer-feedback", (interviewerFeedback) => {
          const sameBatch =
            interviewAssignment &&
            interviewAssignment.batchId.toString() ===
              interviewerFeedback.batch.toString();
          if (sameBatch) getInterviewerNotes(interviewAssignment);
        });
      }

      return () => {
        if (socket) {
          socket.off("interviewer-feedback");
        }
      };
    });

    return (
      <>
        <dialog
          id="my_modal_2"
          className={`modal ${open && "modal-open"}`}
          ref={ref}
        >
          <div className="modal-box max-w-[80rem] h-[90vh]">
            <form method="dialog" onSubmit={() => setOpen(null)}>
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            {interviewAssignment && (
              <div className="flex items-center space-x-3">
                <div className="avatar">
                  <div className={`mask mask-squircle w-12 h-12`}>
                    {interviewer.avatar ? (
                      <img
                        src={interviewer.avatar}
                        alt={interviewer.firstName + " " + interviewer.lastName}
                      />
                    ) : (
                      <span className="bg-gray-200 w-12 h-12 flex items-center justify-center">
                        <BiUser size="1.25em" />
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="font-bold">
                    {interviewer.firstName + " " + interviewer.lastName}'s
                    Calendar
                  </div>
                </div>
              </div>
            )}

            {/* Modal Body */}
            <div className="mt-4 flex gap-4" id="calendar-container">
              {open && (
                <>
                  {!!!appointments ? (
                    "loading..."
                  ) : (
                    <InterviewerCalendar
                      editable={editable}
                      events={events}
                      newEventState={[newEvent, setNewEvent]}
                      requestingAppointmentState={[
                        requestingAppointment,
                        setRequestingAppointment,
                      ]}
                      setSelectedAppointment={setSelectedAppointment}
                      interviewAssignmentStatus={
                        interviewAssignment && interviewAssignment.status
                      }
                      hasActiveAppointment={
                        interviewAssignment.appointment &&
                        ["requested", "scheduled"].includes(
                          interviewAssignment.status
                        )
                      }
                      handleCancelAppointment={handleCancelAppointment}
                      isAppointmentCancelled={isAppointmentCancelled}
                    />
                  )}
                </>
              )}
              {selectedAppointment && (
                <AppointmentDetails
                  appointment={selectedAppointment}
                  collapse={() => setSelectedAppointment(null)}
                />
              )}
              {requestingAppointment && newEvent && (
                <RequestedSlotDetails
                  start={newEvent.start}
                  end={newEvent.end}
                  collapse={() => setNewEvent(null)}
                  setRequestingAppointment={setRequestingAppointment}
                  onSave={requestAppointment}
                />
              )}
            </div>

            <div className="mt-8">
              {notesLoading ? (
                <>
                  <div className="skeleton w-32 h-4 mb-8"></div>
                  <div className="w-full flex flex-col gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <InterviewerFeedback loading={true} key={i} />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h4 className="text-md font-bold mb-4">Interviewer Notes</h4>
                  <div className="w-full flex flex-col gap-4">
                    {interviewerNotes && interviewerNotes.length > 0 ? (
                      interviewerNotes.map((feedback, i) => (
                        <InterviewerFeedback
                          interviewerFeedback={feedback}
                          key={i}
                        />
                      ))
                    ) : (
                      <div className="w-full h-24 border-2 rounded-md border-gray-200 flex flex-col items-center justify-center text-gray-500 gap-2">
                        <BiComment size="1.25em" />
                        <span className="text-xs">No notes yet.</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          <form
            method="dialog"
            className="modal-backdrop"
            onSubmit={() => setOpen(null)}
          >
            <button>close</button>
          </form>
        </dialog>

        {/* Toast Alert when appointment is cancelled */}
        {interviewAssignment && cancellingAppointmentTimeoutId && (
          <div className="toast toast-end z-[999]">
            <div role="alert" class="alert shadow-lg">
              <BiCalendarX size="1.25em" />
              <div>
                <h3 class="font-bold">Interview Appointment.</h3>
                <div class="text-xs">
                  Your appointment{" "}
                  {interviewAssignment.status === "requested" && "request"} with{" "}
                  {interviewer.firstName} {interviewer.lastName} will be
                  cancelled.
                </div>
              </div>
              <button class="btn btn-sm" onClick={undoCancelAppointment}>
                Undo
              </button>
            </div>
          </div>
        )}
      </>
    );
  }
);

export default MemberAppointmentsModal;
