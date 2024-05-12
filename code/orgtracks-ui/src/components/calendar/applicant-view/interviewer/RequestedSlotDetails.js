import { useState } from "react";
import { BiCalendar } from "react-icons/bi";
import dayjs from "dayjs";

const RequestedSlotDetails = ({ start, end, collapse, onSave, setRequestingAppointment }) => {
  const [msg, setMsg] = useState("");
  const [collapsing, setCollapsing] = useState(false);

  return (
    <div
      className={`${
        collapsing ? "w-0 opacity-0" : "w-1/2 opacity-100"
      } border-2 p-4 flex flex-col relative transition-all duration-300`}
    >
      <span className="text-lg">Request an appointment</span>
      <div className="text-xs text-gray-500 flex items-center gap-2">
        <BiCalendar />
        <span>
          {dayjs(start).format("ddd, MMM D, YYYY")} &middot;{" "}
          {dayjs(start).format("h:mma")} – {dayjs(end).format("h:mma")}
        </span>
      </div>
      <div className="mt-4">
        <div className="text-sm font-semibold mb-1">Details</div>
        <p className="text-sm text-gray-500">
          Send an appointment request to the organization member.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-auto flex gap-2 justify-end">
        <button
          className="btn btn-sm btn-ghost text-gray-500"
          onClick={() => {
            setCollapsing(true);
            setTimeout(() => {
              setRequestingAppointment(false);
              collapse();
            }, 200);
          }}
        >
          Cancel
        </button>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => {
            setCollapsing(true);
            setTimeout(() => {
              collapse();
              onSave();
            }, 200);
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default RequestedSlotDetails;
