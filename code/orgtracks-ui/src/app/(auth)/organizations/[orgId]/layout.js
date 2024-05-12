"use client";
import { AuthContext } from "@/context/AuthContext";
import { useContext, useEffect } from "react";
import { OrganizationMemberContext } from "@/context/interview/OrganizationMemberContext";
import { useOrganizationMember } from "@/hooks/interview/useOrganizationMember";

export default function RootLayout({ children }) {
  const { user } = useContext(AuthContext);
  const orgMemberCtxValues = useOrganizationMember(user?._id);

  return (
    <OrganizationMemberContext.Provider value={orgMemberCtxValues}>
      {children}
    </OrganizationMemberContext.Provider>
  );
}
