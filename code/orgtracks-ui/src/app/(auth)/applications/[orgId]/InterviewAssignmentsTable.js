import { useEffect, useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { BiUser } from "react-icons/bi";
import MemberAppointmentsModal from "../../../../components/calendar/applicant-view/interviewer/MemberAppointmentsModal";
import application from "@/utils/api/application";

export default function InterviewAssignmentsTable({
  editable,
  orgId,
  interviewAssignments,
}) {
  const [selectedInterviewAssignment, setSelectedInterviewAssignment] =
    useState(null);

  const onUpdate = () => {
    interviewAssignments.refetch();
  };

  useEffect(() => {
    if (selectedInterviewAssignment) {
      // find the updated interview assignment in interviewAssignments
      const updatedInterviewAssignment = interviewAssignments.data.find(
        (i) => i._id === selectedInterviewAssignment._id
      );
      if (updatedInterviewAssignment) {
        setSelectedInterviewAssignment(updatedInterviewAssignment);
      }
    }
  }, [interviewAssignments]);

  return (
    <>
      <MemberAppointmentsModal
        editable={editable}
        open={!!selectedInterviewAssignment}
        setOpen={setSelectedInterviewAssignment}
        interviewAssignment={selectedInterviewAssignment}
        onUpdate={onUpdate}
      />
      <div className="overflow-x-auto shadow-md rounded-sm">
        <table className="table w-full">
          {/* head */}
          <thead>
            <tr>
              <th>Name</th>
              <th>Appointment</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {!interviewAssignments || interviewAssignments.loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} loading />
              ))
            ) : (
              <>
                {interviewAssignments.data === null && (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center text-xs text-gray-400 p-8 h-80"
                    >
                      There was an error getting interview assignments.
                    </td>
                  </tr>
                )}
                {interviewAssignments.data &&
                  interviewAssignments.data.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center text-xs text-gray-400 p-8 h-80"
                      >
                        No interview assignments found.
                      </td>
                    </tr>
                  )}
                {interviewAssignments.data &&
                  interviewAssignments.data.map((interviewAssignment) => (
                    <TableRow
                      orgId={orgId}
                      key={interviewAssignment._id}
                      interviewAssignment={interviewAssignment}
                      setSelectedInterviewAssignment={
                        setSelectedInterviewAssignment
                      }
                    />
                  ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function TableRow({
  interviewAssignment,
  loading,
  setSelectedInterviewAssignment,
}) {
  const {
    interviewerId: interviewer,
    status,
    appointment,
  } = interviewAssignment || {};

  let appointmentStr = "-";
  if (appointment) {
    const { dtStart, dtEnd } = appointment;

    const start = dayjs(dtStart);
    const end = dayjs(dtEnd);

    if (start.isSame(end, "day")) {
      appointmentStr = `${start.format("MMM D, YYYY")} at ${start.format(
        "hh:mm a"
      )} - ${end.format("hh:mm a")}`;
    } else {
      appointmentStr = `${start.format(
        "MMM D, YYYY at hh:mm a"
      )} - ${end.format("MMM D, YYYY hh:mm a")}`;
    }
  }

  const statuses = {
    scheduled: "badge-primary",
    requested: "badge-primary badge-outline",
    done: "badge-primary bg-teal-500 border-teal-500 text-white",
    cancelled: "badge-warning",
    unscheduled: "badge-outline",
  };
  return (
    <tr>
      <td>
        <div className="flex items-center space-x-3">
          <div className="avatar">
            <div
              className={`mask mask-squircle w-12 h-12 ${
                loading && "skeleton"
              }`}
            >
              {!loading && (
                <>
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
                </>
              )}
            </div>
          </div>
          <div>
            {loading ? (
              <>
                <div className="w-64 h-4 skeleton"></div>
                <div className="w-16 h-4 skeleton"></div>
              </>
            ) : (
              <>
                <div className="font-bold">
                  {interviewer.firstName + " " + interviewer.lastName}
                </div>
                <span className="text-xs text-gray-400">
                  {interviewer.email}
                </span>
              </>
            )}
          </div>
        </div>
      </td>
      <td>
        <span className="flex flex-col items-start gap-1">
          <span className="text-xs text-gray-600">
            {appointmentStr !== "-" && appointmentStr}
          </span>
          {status && (
            <span className={`badge ${statuses[status]} badge-sm`}>
              {status}
            </span>
          )}
        </span>
      </td>
      <th>
        {loading ? (
          <div className="w-16 h-4 skeleton"></div>
        ) : (
          <button
            onClick={() => setSelectedInterviewAssignment(interviewAssignment)}
            className="btn btn-ghost btn-xs"
          >
            view details
          </button>
        )}
      </th>
    </tr>
  );
}
