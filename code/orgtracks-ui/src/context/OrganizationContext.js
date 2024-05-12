import { createContext } from "react";

export const OrganizationContext = createContext({
    organization: {},
    members: {},
    applicants: {},
    departments: {},
});