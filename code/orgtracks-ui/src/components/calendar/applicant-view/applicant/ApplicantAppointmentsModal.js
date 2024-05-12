import { forwardRef, useState, useEffect, useContext } from "react";

import application from "@/utils/api/application";

import { SystemFeedbackContext } from "@/context/SystemFeedbackContext";
import { SocketContext } from "@/context/SocketContext";

import { BiCalendar } from "react-icons/bi";

import AppointmentDetails from "./AppointmentDetails";
import ApplicantCalendar from "./ApplicantCalendar";

const ApplicantAppointmentsModal = forwardRef(
  ({ open, setOpen, batchId }, ref) => {
    const { socket } = useContext(SocketContext);

    const [events, setEvents] = useState([]); // appointments + newEvent
    const [loadingCalendar, setLoadingCalendar] = useState(true);

    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const { showMessage } = useContext(SystemFeedbackContext);

    async function getAppointments(batchId) {
      if (!batchId) return;

      const data = await application.getMyCalendarAsApplicant(batchId);
      if (!data || data.message) {
        showMessage({
          type: "error",
          message: "There was an error while fetching your calendar data.",
        });
        return;
      }
      setEvents(data);
    }

    useEffect(() => {
      getAppointments(batchId);
    }, [batchId]);

    useEffect(() => {
      if (socket) {
        socket.on("appointment", ({ action }) => {
          getAppointments(batchId);
        });
      }

      return () => {
        if (socket) {
          socket.off("appointment");
        }
      };
    }, [socket]);

    return (
      <>
        <dialog
          id="my_modal_2"
          className={`modal ${open && "modal-open"}`}
          ref={ref}
        >
          <div className="modal-box max-w-[80rem] h-[90vh]">
            <form method="dialog" onSubmit={() => setOpen(false)}>
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <div className="flex items-center space-x-3">
              <div className="avatar">
                <div className={`mask mask-squircle w-12 h-12`}>
                  <span className="bg-gray-200 w-12 h-12 flex items-center justify-center">
                    <BiCalendar size="1.25em" />
                  </span>
                </div>
              </div>
              <div>
                <div className="font-bold">My Calendar</div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="mt-4 flex gap-4" id="calendar-container">
              {open && (
                <>
                  {!!!events ? (
                    "loading..."
                  ) : (
                    <ApplicantCalendar
                      events={events}
                      setSelectedAppointment={setSelectedAppointment}
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
            </div>
          </div>
          <form
            method="dialog"
            className="modal-backdrop"
            onSubmit={() => setOpen(false)}
          >
            <button>close</button>
          </form>
        </dialog>
      </>
    );
  }
);

export default ApplicantAppointmentsModal;
