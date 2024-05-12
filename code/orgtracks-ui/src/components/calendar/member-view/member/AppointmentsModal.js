import dayjs from "dayjs";
import { forwardRef, useState, useEffect, useContext } from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./AppointmentsModal.scss";

import application from "@/utils/api/application";

import { SystemFeedbackContext } from "@/context/SystemFeedbackContext";

import {
  BiCalendarX,
  BiCheck,
  BiChevronLeft,
  BiChevronRight,
} from "react-icons/bi";

import AppointmentDetails from "./AppointmentDetails";
import BlockedSlotDetails from "./BlockedSlotDetails";
import organization from "@/utils/api/organization";

const localizer = dayjsLocalizer(dayjs);

const CustomToolbar = ({
  editable,
  date,
  view,
  onNavigate,
  onView,
  blockingState,
  blockSelectedSlot,
}) => {
  const [blocking, setBlocking] = blockingState;
  const [label, setLabel] = useState(dayjs(date).format("MMMM YYYY"));

  const handleViewChange = (event) => {
    onView(event.target.value);
  };

  useEffect(() => {
    switch (view) {
      case "month":
        setLabel(dayjs(date).format("MMMM YYYY"));
        break;
      case "week":
        setLabel(
          `${dayjs(date).startOf("week").format("MMM D")} – ${dayjs(date)
            .endOf("week")
            .format("MMM D, YYYY")}`
        );
        break;
      case "day":
        setLabel(dayjs(date).format("ddd, MMMM D, YYYY"));
        break;
    }
  }, [date, view]);

  return (
    <div className="flex items-center py-4">
      <div className="text-lg font-bold mr-8">{label}</div>
      <select
        className="select select-bordered select-sm mr-4"
        value={view}
        onChange={handleViewChange}
      >
        <option value="day">Day</option>
        <option value="week">Week</option>
        <option value="month">Month</option>
      </select>
      <button
        className="btn btn-sm btn-circle btn-ghost"
        onClick={() => onNavigate("PREV")}
      >
        <BiChevronLeft size="1.5em" />
      </button>
      <button
        className="btn btn-sm btn-outline mx-1"
        onClick={() => onNavigate("TODAY")}
      >
        Today
      </button>
      <button
        className="btn btn-sm btn-circle btn-ghost"
        onClick={() => onNavigate("NEXT")}
      >
        <BiChevronRight size="1.5em" />
      </button>

      <button
        className="btn btn-sm ml-auto"
        onClick={() => setBlocking(!blocking)}
        disabled={!editable}
      >
        {blocking ? (
          <>
            <BiCheck size="1.5em" /> Done
          </>
        ) : (
          <>
            <BiCalendarX size="1.5em" /> Block Time
          </>
        )}
      </button>
    </div>
  );
};

const AppointmentsModal = forwardRef(
  ({ editable, open, setOpen, orgId, batchId, refetchAppointment }, ref) => {
    const [blocking, setBlocking] = useState(false);

    const [events, setEvents] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [newEvent, setNewEvent] = useState(null);

    const { showMessage } = useContext(SystemFeedbackContext);

    const blockSelectedSlot = async () => {
      const res = await organization.blockTimeSlot(orgId, batchId, {
        dtStart: newEvent.start,
        dtEnd: newEvent.end,
      });

      if (res === null) {
        showMessage({
          type: "error",
          message: "There was an error blocking the time slot.",
        });
        return;
      } else {
        showMessage({
          type: "success",
          message: "Successfully blocked the selected time slot.",
        });
      }
    };

    async function getAppointments(orgId, batchId) {
      if (!(orgId && batchId)) return;

      const data = await organization.getMyCalendarAsMember(orgId, batchId);
      if (!data || data.message) {
        showMessage({
          type: "error",
          message:
            "There was an error while fetching the interview appointments.",
        });
        return;
      }
      setEvents(data);

      if (selectedAppointment) {
        const s = data.find((e) => e.id === selectedAppointment.id);
        if (s) {
          setSelectedAppointment(s);
        } else {
          setSelectedAppointment(null);
        }
      }
    }

    const handleResult = (res, messageIfError) => {
      if (res === null) {
        showMessage({
          type: "error",
          message: messageIfError,
        });
        return;
      }

      showMessage({
        type: "success",
        message: res.message,
      });

      getAppointments(orgId, batchId);
    };

    const memberCalendarEventActionHandler = {
      onAccept: async (interviewAssignmentId) => {
        const res = await application.acceptInterviewAppointment(
          interviewAssignmentId
        );
        handleResult(
          res,
          "There was an error accepting the interview appointment."
        );
      },
      onDecline: async (interviewAssignmentId) => {
        const res = await application.declineInterviewAppointment(
          interviewAssignmentId
        );
        handleResult(
          res,
          "There was an error declining the interview appointment."
        );
      },
      onMarkDone: async (interviewAssignmentId) => {
        const res = await application.markDoneInterviewAppointment(
          interviewAssignmentId
        );
        handleResult(
          res,
          "There was an error updating interview appointment status."
        );
      },
      onMarkScheduled: async (interviewAssignmentId) => {
        const res = await application.markScheduledInterviewAppointment(
          interviewAssignmentId
        );
        handleResult(
          res,
          "There was an error reverting interview appointment status."
        );
      },
      onCancel: async (interviewAssignmentId) => {
        const res = await application.cancelInterviewAppointment(
          interviewAssignmentId
        );
        handleResult(
          res,
          "There was an error cancelling the interview appointment."
        );
      },
      onUnblock: async (interviewAssignmentId) => {
        const res = await organization.unblockTimeSlot(
          orgId,
          batchId,
          interviewAssignmentId
        );
        handleResult(
          res,
          "There was an error unblocking the selected time slot."
        );
      },
    };

    useEffect(() => {
      getAppointments(orgId, batchId);
    }, [orgId, batchId, refetchAppointment]);

    return (
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
          <h3 className="font-bold text-lg text-center">My Calendar</h3>

          {/* Modal Body */}
          <div className="mt-4 flex gap-4" id="calendar-container">
            <Calendar
              className="w-full"
              components={{
                toolbar: (props) => (
                  <CustomToolbar
                    {...props}
                    editable={editable}
                    blockingState={[blocking, setBlocking]}
                    orgId={orgId}
                    batchId={batchId}
                    blockSelectedSlot={blockSelectedSlot}
                  />
                ),
              }}
              defaultView="week"
              localizer={localizer}
              events={[...events, ...(newEvent ? [newEvent] : [])]}
              onSelectEvent={(event) => {
                setNewEvent(null);
                setSelectedAppointment(event);
              }}
              onSelectSlot={(slotInfo) => {
                setSelectedAppointment(null);
                setNewEvent({
                  start: slotInfo.start,
                  end: slotInfo.end,
                  status: "editing",
                  title: "",
                });
              }}
              titleAccessor="title"
              startAccessor={(e) => new Date(e.start)}
              endAccessor={(e) => new Date(e.end)}
              style={{ height: 500 }}
              selectable={blocking}
              step={5}
              timeslots={12}
              scrollToTime={dayjs().subtract(1, "hour").toDate()}
              eventPropGetter={(event) => {
                if (event.status === "requested") {
                  return {
                    style: {
                      backgroundColor: "transparent",
                      border: "#5b21b6 solid 2px",
                      color: "#5b21b6",
                      borderRadius: "2px",
                    },
                  };
                }

                if (event.status === "scheduled") {
                  return {
                    style: {
                      backgroundColor: "#5b21b6",
                      border: "none",
                      color: "hsl(174, 83%, 95%)",
                    },
                  };
                }

                if (event.status === "done") {
                  return {
                    style: {
                      backgroundColor: "#14b8a6",
                      border: "none",
                      color: "hsl(160, 84%, 95%)",
                    },
                  };
                }

                if (event.status === "blocked") {
                  return {
                    className: "bg-gray-700",
                    style: {
                      backgroundColor: "#4a5568",
                      border: "none",
                      borderRadius: "0.5rem",
                    },
                  };
                }

                if (event.status === "editing") {
                  return {
                    className: "bg-primary-500",
                    style: {
                      backgroundColor: "hsla(207, 0%, 54%, 0.5)",
                      border: "hsla(207, 0%, 40%, 1) dashed 2px",
                      color: "white",
                    },
                  };
                }

                return {};
              }}
            />
            {selectedAppointment && (
              <AppointmentDetails
                editable={editable}
                appointment={selectedAppointment}
                collapse={() => setSelectedAppointment(null)}
                actionHandler={memberCalendarEventActionHandler}
              />
            )}
            {blocking && newEvent && (
              <BlockedSlotDetails
                start={newEvent.start}
                end={newEvent.end}
                collapse={() => setNewEvent(null)}
                onSave={async () => {
                  await blockSelectedSlot();
                  setNewEvent(null);
                  getAppointments(orgId, batchId);
                }}
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
    );
  }
);

export default AppointmentsModal;
