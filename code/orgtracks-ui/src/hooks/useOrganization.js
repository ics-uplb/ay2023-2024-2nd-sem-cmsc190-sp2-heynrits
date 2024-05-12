import { useState, useEffect, useContext } from "react";
import { useParams } from "next/navigation";

import Organization from "@/utils/api/organization";

/**
 * Returns an object containing organization, departments, and members data, along with their loading states and refetch functions.
 *
 * @return {object} The object with the following properties:
 *   - organization: An object with the properties data, loading, and refetch.
 *     - data: The organization data.
 *     - loading: A boolean indicating if the organization data is currently being fetched.
 *     - refetch: A function to refetch the organization data.
 *   - departments: An object with the properties data, loading, and refetch.
 *     - data: An array of departments.
 *     - loading: A boolean indicating if the departments data is currently being fetched.
 *     - refetch: A function to refetch the departments data.
 *   - members: An object with the properties data, loading, and refetch.
 *     - data: An array of members.
 *     - loading: A boolean indicating if the members data is currently being fetched.
 *     - refetch: A function to refetch the members data.
 */
export const useOrganization = () => {
  const params = useParams();
  const orgId = params["orgId"];

  const [org, setOrg] = useState({});
  const [orgLoading, setOrgLoading] = useState(true);

  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);

  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);

  // application related
  const [batches, setBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(true);

  const [selectedBatch, setSelectedBatch] = useState(null);

  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);

  const fetchOrg = async () => {
    setOrgLoading(true);
    const org = await Organization.getOne(orgId);
    setOrg(org);
    setOrgLoading(false);
  };

  const fetchOrgDepartments = async () => {
    setDepartmentsLoading(true);
    const departments = await Organization.getDepartments(orgId);
    setDepartments(departments);
    setDepartmentsLoading(false);
  };

  const fetchOrgMembers = async () => {
    setMembersLoading(true);
    const members = await Organization.getMembers(orgId);
    setMembers(members);
    setMembersLoading(false);
  };

  const fetchOrgBatches = async () => {
    setBatchesLoading(true);
    const batches = await Organization.getBatches(orgId);
    setBatches(batches);
    setBatchesLoading(false);
  };

  const fetchOrgApplicants = async () => {
    setApplicantsLoading(true);
    const applicants = await Organization.getOrgApplicants(
      orgId,
      selectedBatch
    );
    setApplicants(applicants);
    setApplicantsLoading(false);
  };

  const fetchPreferences = async () => {
    const preferences = await Organization.getPreferences(orgId);
    setSelectedBatch(preferences.lastSelectedBatch);
  };

  useEffect(() => {
    fetchOrg();
    fetchOrgDepartments();
    fetchOrgMembers();
    fetchOrgBatches();
  }, []);

  useEffect(() => {
    console.log({ selectedBatch });
    if (selectedBatch) {
      fetchOrgApplicants();

      Organization.updatePreferences(orgId, {
        batch: selectedBatch,
      });
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
    departments: {
      data: departments,
      loading: departmentsLoading,
      refetch: fetchOrgDepartments,
    },
    members: {
      data: members,
      loading: membersLoading,
      refetch: fetchOrgMembers,
    },
    batches: {
      data: batches,
      loading: batchesLoading,
      refetch: fetchOrgBatches,
    },

    selectedBatch,
    setSelectedBatch,

    applicants: {
      data: applicants,
      loading: applicantsLoading,
      refetch: fetchOrgApplicants,
    },
  };
};
