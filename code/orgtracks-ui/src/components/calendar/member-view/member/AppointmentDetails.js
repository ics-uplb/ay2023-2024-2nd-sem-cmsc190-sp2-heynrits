import { useState } from "react";
import {
  BiArrowFromLeft,
  BiCalendar,
  BiCalendarCheck,
  BiCalendarEdit,
  BiCalendarEvent,
  BiCalendarX,
} from "react-icons/bi";
import dayjs from "dayjs";

const AppointmentDetails = ({
  editable,
  appointment,
  collapse,
  actionHandler,
}) => {
  const { id, start, end, title, notes, status } = appointment;

  const [collapsing, setCollapsing] = useState(false);

  return (
    <div
      className={`${
        collapsing ? "w-0 opacity-0" : "w-1/2 opacity-100"
      } border-2 p-4 flex flex-col relative transition-all duration-300`}
    >
      {/* Collapse Button */}
      <button
        className="absolute translate-y-[30vh] -translate-x-8 active:focus:translate-y-[30vh] active:focus:-translate-x-8 btn btn-sm btn-circle shadow-md"
        onClick={() => {
          setCollapsing(true);
          setTimeout(() => {
            collapse();
          }, 200);
        }}
      >
        <BiArrowFromLeft size="1.25em" />
      </button>

      <span className="text-lg">
        {title} {status !== "blocked" && "- Interview Appointment"}
      </span>
      <div className="text-xs text-gray-500 flex items-center gap-2">
        <BiCalendar />
        <span>
          {dayjs(start).format("ddd, MMM D, YYYY")} &middot;{" "}
          {dayjs(start).format("h:mma")} – {dayjs(end).format("h:mma")}
        </span>
      </div>
      <div className="mt-2 badge badge-sm badge-neutral">{status}</div>
      {notes && (
        <div className="mt-4">
          <div className="text-sm font-semibold mb-1">Notes</div>
          <p className="text-sm text-gray-500">{notes}</p>
        </div>
      )}

      {/* Action Buttons */}
      {editable && (
        <div className="mt-auto flex flex-col gap-2">
          {status === "requested" && (
            <div className="flex">
              <button
                className="btn btn-sm btn-ghost text-gray-500 hover:text-red-600 flex-1"
                onClick={() => actionHandler.onDecline(id)}
              >
                <BiCalendarX size="1.5em" /> Decline
              </button>
              <button
                className="btn btn-sm btn-primary flex-1"
                onClick={() => actionHandler.onAccept(id)}
              >
                <BiCalendarEvent size="1.5em" /> Accept
              </button>
            </div>
          )}
          {status === "scheduled" && (
            <>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => actionHandler.onMarkDone(id)}
              >
                <BiCalendarCheck size="1.5em" /> Mark as done
              </button>
              <div className="flex">
                {/* <button className="btn btn-sm btn-ghost text-gray-500 hover:btn-warning flex-1">
                <BiCalendarEdit size="1.5em" /> Reschedule
              </button> */}
                <button
                  className="btn btn-sm btn-ghost text-gray-500 hover:text-red-600 flex-1"
                  onClick={() => actionHandler.onCancel(id)}
                >
                  <BiCalendarX size="1.5em" /> Cancel
                </button>
              </div>
            </>
          )}
          {status === "done" && (
            <button
              className="btn btn-sm btn-ghost text-gray-500 hover:text-amber-600"
              onClick={() => actionHandler.onMarkScheduled(id)}
            >
              <BiCalendarEvent size="1.5em" /> Revert to Scheduled
            </button>
          )}
          {status === "blocked" && (
            <button
              className="btn btn-sm btn-ghost text-gray-500 hover:text-primary"
              onClick={() => actionHandler.onUnblock(id)}
            >
              <BiCalendarX size="1.5em" /> Unblock
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentDetails;
