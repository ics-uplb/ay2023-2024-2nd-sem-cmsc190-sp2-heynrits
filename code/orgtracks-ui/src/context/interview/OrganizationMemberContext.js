import { createContext } from "react";

export const OrganizationMemberContext = createContext({
  organization: {},
  batch: {},
  selectedBatch: null,
  setSelectedBatch: () => {},
  interviewAssignments: {},
  applicants: {},
});
