"use client";
import { useContext, useEffect, useState } from "react";
import Link from "next/link";

import application from "@/utils/api/application";
import { useOrganizationApplicant } from "@/hooks/interview/useOrganizationApplicant";

import { AuthContext } from "@/context/AuthContext";
import { SocketContext } from "@/context/SocketContext";

import { BiCalendar } from "react-icons/bi";

import InterviewAssignmentsTable from "./InterviewAssignmentsTable";
import ApplicantAppointmentsModal from "@/components/calendar/applicant-view/applicant/ApplicantAppointmentsModal";

export default function MyApplications({ params, searchParams }) {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  if (!user) {
    return null;
  }

  const { organization, interviewAssignments } = useOrganizationApplicant(
    user ? user._id : null
  );

  let myInterviewProgress = {
    done: null,
    total: null,
  };

  if (interviewAssignments && interviewAssignments.data) {
    myInterviewProgress = {
      done: interviewAssignments.data.filter((d) => d.status === "done").length,
      total: interviewAssignments.data.length,
    };
  }

  const [myCalendarOpen, setMyCalendarOpen] = useState(false);
  const batchId = searchParams.batch;

  const [applicantStatus, setApplicantStatus] = useState(null);

  async function fetchStatus(orgId, batchId) {
    const myApplicantStatus = await application.getStatus(orgId, batchId);
    if (!myApplicantStatus || myApplicantStatus.message) {
      return;
    }
    setApplicantStatus(myApplicantStatus.status);
  }

  useEffect(() => {
    if (!organization || !organization.data || !batchId) {
      return;
    }

    fetchStatus(organization.data._id, batchId);
  }, [batchId, organization]);

  useEffect(() => {
    if (socket) {
      socket.on("appointment", ({ action }) => {
        interviewAssignments.refetch();
      });
    }

    return () => {
      if (socket) {
        socket.off("appointment");
      }
    };
  }, [socket]);

  return (
    <main className="px-8 py-6">
      <div className="breadcrumbs mb-8 pt-0 text-sm">
        <ul>
          <li>
            <Link href="/applications" className="font-normal text-gray-600">
              My Applications
            </Link>
          </li>
          {!organization || organization.loading ? (
            <li className="skeleton w-64 h-4"></li>
          ) : (
            <li className="font-bold text-primary">
              {organization.data.name} ({organization.data.shortName})
            </li>
          )}
        </ul>
      </div>

      <div className="flex items-end justify-between mb-4">
        <div>
          <h3 className="font-bold mb-2 text-primary">Inteview Assignments</h3>
          {myInterviewProgress.total === null ? (
            <>
              <div className="skeleton w-16 h-4 mb-1"></div>
              <progress className="progress w-32"></progress>
            </>
          ) : (
            <>
              <p className="text-xs text-primary">
                {myInterviewProgress.done} of {myInterviewProgress.total}{" "}
                completed
              </p>
              <progress
                className="progress progress-primary w-56"
                value={myInterviewProgress.done}
                max={`${myInterviewProgress.total}`}
              ></progress>
            </>
          )}
        </div>

        <button
          className="btn btn-primary btn-sm btn-outline"
          onClick={() => setMyCalendarOpen(true)}
        >
          <BiCalendar />
          View My Appointments
        </button>
      </div>

      <InterviewAssignmentsTable
        editable={applicantStatus === "confirmed"}
        interviewAssignments={interviewAssignments}
        orgId={params.orgId}
      />

      <ApplicantAppointmentsModal
        open={myCalendarOpen}
        setOpen={setMyCalendarOpen}
        batchId={batchId}
      />
    </main>
  );
}
