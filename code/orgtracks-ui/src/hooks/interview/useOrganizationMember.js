import { useState, useEffect, useContext } from "react";
import { useParams } from "next/navigation";

import Organization from "@/utils/api/organization";
import Application from "@/utils/api/application";

export const useOrganizationMember = (memberId) => {
  if (!memberId) {
    return {};
  }

  const params = useParams();
  const orgId = params["orgId"];

  const [org, setOrg] = useState({});
  const [orgLoading, setOrgLoading] = useState(true);

  const [role, setRole] = useState([]);
  const [roleLoading, setRoleLoading] = useState(true);

  // application related
  const [batches, setBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(true);

  const [selectedBatch, setSelectedBatch] = useState(null);

  const [interviewAssignments, setInterviewAssignments] = useState([]);
  const [interviewAssignmentsLoading, setInterviewAssignmentsLoading] =
    useState(false);

  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);

  const [applicationEvaluation, setApplicationEvaluation] = useState({});
  const [applicationEvaluationLoading, setApplicationEvaluationLoading] =
    useState(false);

  const fetchOrg = async () => {
    setOrgLoading(true);
    const org = await Organization.getOne(orgId);
    setOrg(org);
    setOrgLoading(false);
  };

  const fetchRole = async () => {
    setRoleLoading(true);
    const role = await Organization.getMemberRole(orgId);
    setRole(role);
    setRoleLoading(false);
  };

  const fetchOrgBatches = async () => {
    setBatchesLoading(true);
    const batches = await Organization.getBatches(orgId);
    setBatches(batches);
    setBatchesLoading(false);
  };

  const fetchInterviewAssignments = async () => {
    setInterviewAssignmentsLoading(true);
    const assignments = await Organization.getInterviewAssignmentsOfMember(
      orgId,
      selectedBatch,
      memberId
    );
    setInterviewAssignments(assignments);
    setInterviewAssignmentsLoading(false);
  };

  const fetchOrgApplicants = async () => {
    setApplicantsLoading(true);
    const applicants = await Organization.getAllInterviewAssignments(
      orgId,
      selectedBatch
    );
    setApplicants(applicants);
    setApplicantsLoading(false);
  };

  const fetchApplicationEvaluation = async (batchId) => {
    setApplicationEvaluationLoading(true);
    const evaluation = await Application.getApplicationEvaluation(batchId);
    setApplicationEvaluation(evaluation);
    setApplicationEvaluationLoading(false);
  };

  const fetchPreferences = async () => {
    const preferences = await Organization.getPreferences(orgId);
    setSelectedBatch(preferences.lastSelectedBatch);
  };

  useEffect(() => {
    fetchOrg();
    fetchRole();
    fetchOrgBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      console.log({ selectedBatch });
      Organization.updatePreferences(orgId, {
        batch: selectedBatch,
      });

      fetchInterviewAssignments();
      fetchOrgApplicants();
      fetchApplicationEvaluation(selectedBatch);
    }
  }, [selectedBatch]);

  useEffect(() => {
    if (orgId) {
      fetchPreferences();
    }
  }, [batches]);

  return {
    organization: {
      data: org,
      loading: orgLoading,
      refetch: fetchOrg,
    },
    role: {
      data: role,
      loading: roleLoading,
      refetch: fetchRole,
    },
    batches: {
      data: batches,
      loading: batchesLoading,
      refetch: fetchOrgBatches,
    },

    selectedBatch,
    setSelectedBatch,

    interviewAssignments: {
      data: interviewAssignments,
      loading: interviewAssignmentsLoading,
      refetch: fetchInterviewAssignments,
    },
    applicants: {
      data: applicants,
      loading: applicantsLoading,
      refetch: fetchOrgApplicants,
    },
    applicationEvaluation: {
      data: applicationEvaluation,
      loading: applicationEvaluationLoading,
      refetch: fetchApplicationEvaluation,
    },
  };
};
