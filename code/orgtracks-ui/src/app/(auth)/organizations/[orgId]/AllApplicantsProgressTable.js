import dayjs from "dayjs";
import {
  BiCalendarCheck,
  BiCheck,
  BiShow,
  BiTime,
  BiX,
  BiUser,
} from "react-icons/bi";
import { GrDrawer } from "react-icons/gr";
import { EvaluationStatus } from "./page";

export default function AllApplicantsProgressTable({
  applicantsRoles,
  interviewAssignments,
  visibleProgress,
  isEvaluating,
  hasEvaluated,
  evaluationStatus,
  handleEvaluationStatus,
  setSelectedInterviewAssignment,
}) {
  return (
    <div className="overflow-x-auto shadow-md rounded-sm">
      <table className="table w-full max-h-screen">
        {/* head */}
        <thead>
          <tr>
            <th className="w-1/5">Applicant</th>
            {hasEvaluated ? (
              <>
                <th className="w-1/5">Evaluation</th>
              </>
            ) : (
              <>
                {visibleProgress && (
                  <th className="w-1/5">Applicant Progress</th>
                )}
              </>
            )}
            <th className="w-1/5">Actions</th>
          </tr>
        </thead>
        <tbody>
          {!applicantsRoles || applicantsRoles.loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} loading />
            ))
          ) : (
            <>
              {applicantsRoles.data === null && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-xs text-gray-400 p-8 h-80"
                  >
                    There was an error getting the applicants.
                  </td>
                </tr>
              )}
              {applicantsRoles.data &&
                applicantsRoles.data.map((roleAssignment) => (
                  <TableRow
                    visibleProgress={visibleProgress}
                    key={roleAssignment._id}
                    roleAssignment={roleAssignment}
                    interviewAssignment={interviewAssignments.data.find(
                      (interviewAssignment) =>
                        interviewAssignment.applicantId._id ===
                        roleAssignment.userId._id
                    )}
                    isEvaluating={isEvaluating}
                    hasEvaluated={hasEvaluated}
                    evaluationStatus={evaluationStatus.find(
                      (e) => e._id === roleAssignment.userId._id
                    )}
                    handleEvaluationStatus={handleEvaluationStatus}
                    setSelectedInterviewAssignment={
                      setSelectedInterviewAssignment
                    }
                  />
                ))}
              {/* No data */}
              {applicantsRoles.data.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-xs text-gray-400 p-8 h-80"
                  >
                    <span className="flex flex-col gap-4 items-center">
                      <GrDrawer size="1.5rem" />
                      <span>
                        No Applicants.
                        <br />
                        Your organization admin will assign the interview
                        assignments in this batch.
                      </span>
                    </span>
                  </td>
                </tr>
              )}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}

function TableRow({
  loading,
  visibleProgress,
  interviewAssignment,
  roleAssignment,
  isEvaluating,
  hasEvaluated,
  evaluationStatus,
  handleEvaluationStatus,
  setSelectedInterviewAssignment,
}) {
  const badgeColor = (status) => {
    switch (status) {
      case "scheduled":
        return "badge-primary";
      case "requested":
        return "badge-primary badge-outline";
      case "done":
        return "badge-primary bg-teal-500 border-teal-500 text-white";
      case "cancelled":
        return "badge-error";
      case "rescheduled":
        return "badge-info";
      default:
        return "badge-outline";
    }
  };

  const badgeColor2 = (status) => {
    switch (status) {
      case "accepted":
        return "badge-primary bg-teal-500 border-teal-500 text-white";
      case "rejected":
        return "badge-primary bg-pink-500 border-pink-500 text-white";
      case "withdrawn":
        return "badge-warning";
      default:
        return "badge-ghost";
    }
  };

  const progressColor = (type, progress) => {
    if (type == "bg") {
      if (progress.done === 0) return "bg-gray-100";
      if (progress.done === progress.total) return "bg-teal-500";
      return "bg-cyan-500";
    } else {
      if (progress.done === 0) return "text-gray-400";
      if (progress.done === progress.total) return "text-white";
      return "text-white";
    }

    return null;
  };

  return (
    <tr>
      <td className="w-1/5">
        <div className="flex items-center gap-2">
          <div
            className={`mask mask-squircle w-10 h-10 ${loading && "skeleton"}`}
          >
            {!loading && (
              <>
                {roleAssignment.userId.avatar ? (
                  <img
                    src={roleAssignment.userId.avatar}
                    alt="avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="bg-gray-200 w-10 h-10 flex items-center justify-center">
                    <BiUser size="1.25em" />
                  </span>
                )}
              </>
            )}
          </div>
          <div>
            {loading ? (
              <>
                <div className="w-32 h-4 skeleton mb-1"></div>
                <div className="w-32 h-4 skeleton"></div>
              </>
            ) : (
              <>
                <p className="font-bold">
                  {roleAssignment.userId.firstName +
                    " " +
                    roleAssignment.userId.lastName}
                </p>
                <p className="text-xs text-gray-400">
                  {roleAssignment.userId.email}
                </p>
              </>
            )}
          </div>
        </div>
      </td>
      {hasEvaluated ? (
        <>
          <td>
            <span
              className={`text-xs badge badge-md ${badgeColor2(
                evaluationStatus?.status
              )} text-white`}
            >
              {evaluationStatus?.status === "accepted" && (
                <BiCheck size="1.25em" />
              )}
              {evaluationStatus?.status === "rejected" && <BiX size="1.25em" />}
              {evaluationStatus?.status}
            </span>
          </td>
        </>
      ) : (
        <>
          {visibleProgress && (
            <td className="w-1/5">
              {loading ? (
                <div className="w-32 h-4 skeleton"></div>
              ) : (
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${progressColor(
                      "bg",
                      roleAssignment.progress
                    )} mr-2`}
                  >
                    <p
                      className={`text-xs ${progressColor(
                        "text",
                        roleAssignment.progress
                      )}`}
                    >
                      {roleAssignment.progress.done}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    / {roleAssignment.progress.total}
                  </p>
                </div>
              )}
            </td>
          )}
        </>
      )}
      <td className="w-1/5">
        {loading ? (
          <div className="w-16 h-4 skeleton"></div>
        ) : (
          <>
            {isEvaluating ? (
              <div className="join join-vertical lg:join-horizontal">
                <button
                  className={`btn btn-xs join-item ${
                    evaluationStatus?.status === "accepted" &&
                    "bg-teal-500 text-white"
                  }`}
                  onClick={() =>
                    handleEvaluationStatus(
                      roleAssignment.userId._id,
                      "accepted"
                    )
                  }
                >
                  <BiCheck size="1.25em" /> Accept
                </button>
                <button
                  className={`btn btn-xs join-item ${
                    evaluationStatus?.status === "rejected" &&
                    "bg-pink-500 text-white"
                  }`}
                  onClick={() =>
                    handleEvaluationStatus(
                      roleAssignment.userId._id,
                      "rejected"
                    )
                  }
                >
                  <BiX size="1.25em" /> Reject
                </button>
              </div>
            ) : (
              <button
                className="btn btn-ghost btn-xs"
                onClick={() =>
                  setSelectedInterviewAssignment(interviewAssignment)
                }
              >
                <BiShow size="1.25em" /> View
              </button>
            )}
          </>
        )}
      </td>
    </tr>
  );
}
