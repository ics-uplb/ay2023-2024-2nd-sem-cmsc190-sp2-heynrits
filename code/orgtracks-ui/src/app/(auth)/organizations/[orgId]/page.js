"use client";
import { useContext, useEffect, useState } from "react";
import dayjs from "dayjs";

import application from "@/utils/api/application";

import { OrganizationMemberContext } from "@/context/interview/OrganizationMemberContext";
import { SystemFeedbackContext } from "@/context/SystemFeedbackContext";
import { SocketContext } from "@/context/SocketContext";

import Link from "next/link";
import {
  BiCalendar,
  BiCheck,
  BiStar,
  BiUpload,
  BiX,
  BiHourglass,
} from "react-icons/bi";
import { GrDrawer } from "react-icons/gr";

import IntervieweesProgressTable from "./IntervieweesProgressTable";
import AppointmentsModal from "@/components/calendar/member-view/member/AppointmentsModal";
import ViewApplicantModal from "./ViewApplicantModal";
import AllApplicantsProgressTable from "./AllApplicantsProgressTable";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import AlertDialog from "@/components/AlertDialog";

export default function OrganizationPage() {
  const { showMessage } = useContext(SystemFeedbackContext);
  const { socket } = useContext(SocketContext);

  const {
    organization,
    batches,
    selectedBatch,
    setSelectedBatch,
    interviewAssignments,
    applicants,
    applicationEvaluation,
    role,
  } = useContext(OrganizationMemberContext);

  const [showing, setShowing] = useState("Interviewees");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedInterviewAssignment, setSelectedInterviewAssignment] =
    useState(null);

  const [myInterviewProgress, setMyInterviewProgress] = useState({
    done: null,
    total: null,
  });

  const [evaluationAlertModalOpen, setEvaluationAlertModalOpen] = useState(false);
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationStatus, setEvaluationStatus] = useState([]);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (interviewAssignments && interviewAssignments.data) {
      setMyInterviewProgress({
        done: interviewAssignments.data.filter((d) => d.status === "done")
          .length,
        total: interviewAssignments.data.length,
      });

      if (selectedInterviewAssignment) {
        const updatedInterviewAssignment = interviewAssignments.data.find(
          (i) => i._id === selectedInterviewAssignment._id
        );
        if (updatedInterviewAssignment) {
          setSelectedInterviewAssignment(updatedInterviewAssignment);
        }
      }
    }
  }, [interviewAssignments]);

  useEffect(() => {
    if (
      applicationEvaluation &&
      applicationEvaluation.data &&
      applicationEvaluation.data._id
    ) {
      setHasEvaluated(true);
      setEvaluationStatus([
        ...applicationEvaluation.data.applicants.accepted.map((a) => ({
          _id: a,
          status: "accepted",
        })),
        ...applicationEvaluation.data.applicants.rejected.map((a) => ({
          _id: a,
          status: "rejected",
        })),
      ]);
      setShowing("All");
    } else if (applicants && applicants.data) {
      setEvaluationStatus(
        applicants.data.map((d) => ({ _id: d.userId._id, status: null }))
      );
      setHasEvaluated(false);
    } else {
      setHasEvaluated(false);
    }
  }, [applicationEvaluation, applicants]);

  const handleEvaluationStatus = (id, status) => {
    setEvaluationStatus((prev) => {
      const newStatus = prev.map((s) => {
        if (s._id === id) {
          return { _id: id, status };
        }
        return s;
      });
      return newStatus;
    });
  };

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

    interviewAssignments.refetch();
    applicants.refetch();
    setRefetchAppointmentCount((prev) => prev + 1);
  };

  const [refetchAppointmentCount, setRefetchAppointmentCount] = useState(0);
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
  };

  const evaluateApplicants = async () => {
    for (let i = 0; i < evaluationStatus.length; i++) {
      if (evaluationStatus[i].status === null) {
        setEvaluationAlertModalOpen(true);
        return;
      }
    }

    const accepted = [];
    const rejected = [];
    for (const evalStatus of evaluationStatus) {
      if (evalStatus.status === "accepted") {
        accepted.push(evalStatus._id);
      } else if (evalStatus.status === "rejected") {
        rejected.push(evalStatus._id);
      }
    }

    const res = await application.evaluateApplicants(selectedBatch, {
      accepted,
      rejected,
    });

    if (res === null) {
      showMessage({
        type: "error",
        message: "There was an error evaluating the applicants.",
      });
      return;
    } else {
      showMessage({
        type: "success",
        message:
          "Applicants have been evaluated! Submit to OSAM System to finalize.",
      });

      applicationEvaluation.refetch(selectedBatch);
      setIsEvaluating(false);
    }
  };

  const submitToOSAM = async () => {
    setSubmitLoading(true);
    const res = await application.submitToOSAM(selectedBatch);
    setSubmitLoading(false);

    if (res === null) {
      showMessage({
        type: "error",
        message: "There was an error transmitting data to OSAM.",
      });
      return;
    } else {
      showMessage({
        type: "success",
        message: "Accepted applicants' info have been reported to OSAM.",
      });

      applicationEvaluation.refetch(selectedBatch);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("appointment", ({ action, batchId }) => {
        if (selectedBatch === batchId) {
          interviewAssignments.refetch();
          applicants.refetch();
          setRefetchAppointmentCount((prev) => prev + 1);
        }
      });

      socket.on("progress-update", (batchId) => {
        if (selectedBatch === batchId) {
          interviewAssignments.refetch();
          applicants.refetch();
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("appointment");
        socket.off("progress-update");
      }
    };
  }, [socket, selectedBatch]);

  return (
    <main className="px-8 py-4">
      <div className="mb-4">
        {!organization || organization.loading ? (
          <div className="skeleton w-72 h-8"></div>
        ) : (
          <div className="text-sm breadcrumbs text-gray-600">
            <ul>
              <li>
                <Link href="/organizations">My Organizations</Link>
              </li>
              <li>
                <Link
                  href={`/organizations/${organization.data._id}`}
                  className="font-bold text-primary"
                >
                  {organization.data.name}
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="flex flex-col">
        {!batches || batches.loading ? (
          <>
            <div className="skeleton w-12 h-4 mb-1"></div>
            <div className="skeleton w-64 h-8"></div>
          </>
        ) : (
          <>
            <span className="text-xs text-primary">Select Applicant Batch</span>
            <select
              className="select select-bordered select-sm w-72 font-normal"
              value={selectedBatch || ""}
              onChange={(e) => {
                setHasEvaluated(false);
                setIsEvaluating(false);
                setSelectedBatch(e.target.value);
              }}
            >
              <option value="" disabled>
                Select Batch...
              </option>
              {batches &&
                batches.data &&
                batches.data.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} {b.archived && "(archived)"}
                  </option>
                ))}
            </select>
          </>
        )}
      </div>

      {!batches || batches.loading ? (
        <>
          <div className="skeleton w-24 h-6 mt-4 mb-2"></div>
          <div className="skeleton w-full h-28"></div>
        </>
      ) : (
        <>
          <h2 className="text-md font-bold mt-4 mb-4 text-primary">Applicants</h2>
          {!selectedBatch ? (
            <>
              <div className="flex items-center justify-center px-4 py-12 shadow-sm border-2 border-gray-100 rounded-md">
                <span className="flex flex-col gap-4 items-center text-gray-400">
                  <GrDrawer size="1.5rem" />
                  <span className="text-xs">
                    Select a batch to view the list of applicants.
                  </span>
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Showing</span>
                  <div className="tabs tabs-boxed">
                    <button
                      className={`tab tab-sm ${
                        showing === "All" ? "tab-active" : ""
                      }`}
                      onClick={() => setShowing("All")}
                    >
                      All
                    </button>
                    {!hasEvaluated && !isEvaluating && (
                      <button
                        className={`tab tab-sm ${
                          showing === "Interviewees" ? "tab-active" : ""
                        }`}
                        onClick={() => setShowing("Interviewees")}
                      >
                        Interviewees
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!hasEvaluated && (
                    <>
                      {isEvaluating ? (
                        <>
                          <button
                            className="btn btn-sm"
                            onClick={() => {
                              setEvaluationStatus(
                                applicants &&
                                  applicants.data &&
                                  applicants.data.map((d) => ({
                                    _id: d.userId._id,
                                    status: null,
                                  }))
                              );
                              setIsEvaluating(false);
                            }}
                          >
                            <BiX size="1.25em" /> Cancel
                          </button>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={evaluateApplicants}
                          >
                            <BiCheck size="1.25em" /> Confirm
                          </button>
                        </>
                      ) : (
                        <>
                          {role && role.data && role.data.includes("admin") && (
                            <button
                              className="btn btn-outline btn-sm btn-primary"
                              onClick={() => {
                                setShowing("All");
                                setIsEvaluating(true);
                              }}
                              disabled={!!!selectedBatch}
                            >
                              <BiStar size="1.25em" /> Evaluate Applicants
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-primary btn-outline"
                            onClick={() => setCalendarOpen(true)}
                            disabled={!!!selectedBatch}
                          >
                            <BiCalendar size="1.25em" /> View My Appointments
                          </button>
                        </>
                      )}
                    </>
                  )}

                  {role &&
                    role.data &&
                    role.data.includes("admin") &&
                    hasEvaluated && (
                      <div className="flex flex-col items-end gap-1">
                        <button
                          className="btn btn-sm btn-primary"
                          disabled={
                            (applicationEvaluation.data &&
                              applicationEvaluation.data.transmissionDate) ||
                            submitLoading
                          }
                          onClick={() => setSubmitModalOpen(true)}
                        >
                          <BiUpload size="1.25em" /> Submit
                          {applicationEvaluation.data &&
                            applicationEvaluation.data.transmissionDate &&
                            "ted"}
                          {submitLoading && "ting"} to OSAM System
                        </button>
                        {applicationEvaluation.data &&
                          applicationEvaluation.data.transmissionDate && (
                            <div className="text-xs text-gray-400">
                              {dayjs(
                                applicationEvaluation.data.transmissionDate
                              ).format("on MMM D, YYYY [at] h:mm A")}
                            </div>
                          )}
                      </div>
                    )}
                </div>
              </div>
              <div className="mb-8">
                {!hasEvaluated && !isEvaluating && (
                  <>
                    {myInterviewProgress.total === null ? (
                      <div className="w-32 h-4 skeleton"></div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-primary">
                          <span className="flex gap-2">
                            <BiHourglass size="1rem" /> My Interview Progress: {myInterviewProgress.done} of{" "}
                          {myInterviewProgress.total} done

                          </span>
                        </span>
                        <progress
                          className="progress progress-primary w-56"
                          value={myInterviewProgress.done}
                          max={myInterviewProgress.total}
                        ></progress>
                      </div>
                    )}
                  </>
                )}
              </div>
              {showing === "All" ? (
                <AllApplicantsProgressTable
                  visibleProgress={
                    role &&
                    role.data &&
                    (role.data.includes("admin") ||
                      role.data.includes("officer"))
                  }
                  applicantsRoles={applicants}
                  interviewAssignments={interviewAssignments}
                  hasEvaluated={hasEvaluated}
                  isEvaluating={isEvaluating}
                  evaluationStatus={evaluationStatus}
                  handleEvaluationStatus={handleEvaluationStatus}
                  setSelectedInterviewAssignment={
                    setSelectedInterviewAssignment
                  }
                />
              ) : (
                <IntervieweesProgressTable
                  visibleProgress={
                    role &&
                    role.data &&
                    (role.data.includes("admin") ||
                      role.data.includes("officer"))
                  }
                  interviewAssignments={interviewAssignments}
                  hasEvaluated={hasEvaluated}
                  isEvaluating={isEvaluating}
                  evaluationStatus={evaluationStatus}
                  handleEvaluationStatus={handleEvaluationStatus}
                  setSelectedInterviewAssignment={
                    setSelectedInterviewAssignment
                  }
                />
              )}
              <AppointmentsModal
                refetchAppointment={refetchAppointmentCount}
                editable={
                  !(
                    applicationEvaluation.data &&
                    applicationEvaluation.data.transmissionDate
                  )
                }
                open={calendarOpen}
                setOpen={setCalendarOpen}
                orgId={organization?.data?._id}
                batchId={selectedBatch}
              />
              <ViewApplicantModal
                editable={
                  !(
                    applicationEvaluation.data &&
                    applicationEvaluation.data.transmissionDate
                  )
                }
                hasEvaluated={hasEvaluated}
                open={selectedInterviewAssignment !== null}
                setOpen={setSelectedInterviewAssignment}
                interviewAssignment={selectedInterviewAssignment}
                actionHandler={memberCalendarEventActionHandler}
              />
              <ConfirmationDialog
                title="Submit to OSAM System"
                message={`This will finalize the application process for this batch and submit the info of accepted applicants to OSAM System.`}
                open={submitModalOpen}
                setOpen={setSubmitModalOpen}
                onConfirm={() => {
                  submitToOSAM();
                  setSubmitModalOpen(false);
                }}
                onCancel={() => setSubmitModalOpen(false)}
              />
              <AlertDialog
                title="Applicant Evaluation"
                message="Please evaluate all applicants before confirming."
                open={evaluationAlertModalOpen}
                setOpen={setEvaluationAlertModalOpen}
              />
            </>
          )}
        </>
      )}
    </main>
  );
}
