import { useState, useEffect } from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./ApplicantCalendar.scss";

import {
  BiCalendarEvent,
  BiCalendarX,
  BiCheck,
  BiChevronLeft,
  BiChevronRight,
  BiUser,
  BiX,
} from "react-icons/bi";

const localizer = dayjsLocalizer(dayjs);

const CustomToolbar = ({ date, view, onNavigate, onView }) => {
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
      {/* left side */}
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
    </div>
  );
};

const ApplicantCalendar = ({ events, setSelectedAppointment }) => {
  return (
    <Calendar
      className="w-full"
      components={{
        toolbar: (props) => <CustomToolbar {...props} />,
      }}
      defaultView="week"
      localizer={localizer}
      events={events}
      onSelectEvent={(event) => {
        setSelectedAppointment(event);
      }}
      titleAccessor="title"
      // RBC expects a true JS `Date` object, not a string
      startAccessor={(e) => new Date(e.start)}
      endAccessor={(e) => new Date(e.end)}
      style={{ height: 500 }}
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
              borderRadius: "2px"
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

        if (event.blocked) {
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
  );
};

export default ApplicantCalendar;
