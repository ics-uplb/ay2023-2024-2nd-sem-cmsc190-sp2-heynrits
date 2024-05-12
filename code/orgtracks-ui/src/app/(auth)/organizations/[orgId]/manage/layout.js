"use client";
import Link from "next/link";

import { OrganizationContext } from "@/context/OrganizationContext";
import { useOrganization } from "@/hooks/useOrganization";

import ManageOrgSidebar from "./Sidebar";

export default function ManageOrg({ children }) {
  const orgContextValues = useOrganization();
  const { organization } = orgContextValues;

  return (
    <OrganizationContext.Provider value={orgContextValues}>
      <main className="px-8 py-4">
        <div className="mb-8">
          <div className="text-sm breadcrumbs text-gray-600">
            <ul>
              {organization.loading ? (
                <li className="skeleton w-64 h-4"></li>
              ) : (
                <>
                  <li>
                    <Link href="/organizations">My Organizations</Link>
                  </li>
                  {organization.data?.name && (
                    <li>
                      <Link
                        href={`/organizations/${organization.data._id}`}
                        className="font-bold text-primary"
                      >
                        {organization.data.name}
                      </Link>
                    </li>
                  )}
                </>
              )}
            </ul>
          </div>
          <h2 className="text-md font-bold text-primary mt-4">Manage Organization</h2>
        </div>

        <div className="flex gap-4 md:gap-8 flex-col md:flex-row">
          <ManageOrgSidebar />
          <div className="flex-grow">{children}</div>
        </div>
      </main>
    </OrganizationContext.Provider>
  );
}
