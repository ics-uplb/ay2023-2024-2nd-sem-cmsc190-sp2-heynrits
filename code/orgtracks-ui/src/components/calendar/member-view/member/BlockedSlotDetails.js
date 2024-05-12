import { useState } from "react";
import { BiCalendar } from "react-icons/bi";
import dayjs from "dayjs";

const BlockedSlotDetails = ({ start, end, collapse, onSave }) => {
  const [msg, setMsg] = useState("");
  const [collapsing, setCollapsing] = useState(false);

  return (
    <div
      className={`${
        collapsing ? "w-0 opacity-0" : "w-1/2 opacity-100"
      } border-2 p-4 flex flex-col relative transition-all duration-300`}
    >
      <span className="text-lg">Blocked Time</span>
      <div className="text-xs text-gray-500 flex items-center gap-2">
        <BiCalendar />
        <span>
          {dayjs(start).format("ddd, MMM D, YYYY")} &middot;{" "}
          {dayjs(start).format("h:mma")} – {dayjs(end).format("h:mma")}
        </span>
      </div>
      <div className="mt-4">
        <div className="text-sm font-semibold mb-1">Message</div>
        <p className="text-sm text-gray-500">
          This time slot will be blocked from setting appointments.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-auto flex gap-2 justify-end">
        <button
          className="btn btn-sm btn-ghost text-gray-500"
          onClick={() => {
            setCollapsing(true);
            setTimeout(() => {
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

export default BlockedSlotDetails;
