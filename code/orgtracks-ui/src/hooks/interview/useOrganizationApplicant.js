import { useState, useEffect, useContext } from "react";
import { useParams, useRouter } from "next/navigation";

import Organization from "@/utils/api/organization";

export const useOrganizationApplicant = (applicantId) => {
  if (!applicantId) {
    return {};
  }

  const params = useParams();
  const urlParams = new URLSearchParams(window.location.search);

  const orgId = params["orgId"];
  const batchId = urlParams.get('batch');

  const [org, setOrg] = useState({});
  const [orgLoading, setOrgLoading] = useState(true);

  // application related
  const [interviewAssignments, setInterviewAssignments] = useState([]);
  const [interviewAssignmentsLoading, setInterviewAssignmentsLoading] =
    useState(false);

  const fetchOrg = async () => {
    setOrgLoading(true);
    const org = await Organization.getOne(orgId);
    setOrg(org);
    setOrgLoading(false);
  };

  const fetchInterviewAssignments = async () => {
    setInterviewAssignmentsLoading(true);
    const assignments = await Organization.getInterviewAssignmentsOfApplicant(
      orgId,
      batchId,
      applicantId
    );
    setInterviewAssignments(assignments);
    setInterviewAssignmentsLoading(false);
  };

  useEffect(() => {
    fetchOrg();
    fetchInterviewAssignments();
  }, [orgId, batchId]);

  return {
    organization: {
      data: org,
      loading: orgLoading,
      refetch: fetchOrg,
    },
    interviewAssignments: {
      data: interviewAssignments,
      loading: interviewAssignmentsLoading,
      refetch: fetchInterviewAssignments,
    },
  };
};
