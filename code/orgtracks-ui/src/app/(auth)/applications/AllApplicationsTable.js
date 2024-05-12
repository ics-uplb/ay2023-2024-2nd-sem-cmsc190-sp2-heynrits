"use client";
import { useState, useEffect } from "react";
import Application from "@/utils/api/application";
import dayjs from "dayjs";
import Link from "next/link";
import { BiBuilding } from "react-icons/bi";
import { toBase64Src } from "@/utils/generic";

export default function AllApplicationsTable() {
  const [loading, setLoading] = useState(true);
  const [orgApplicantRoles, setOrgApplicantRoles] = useState([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const myApplications = await Application.getAll();
      setOrgApplicantRoles(myApplications);
      setLoading(false);
    }

    fetchData();
  }, []);

  return (
    <div className="overflow-x-auto shadow-md rounded-sm">
      <table className="table w-full">
        {/* head */}
        <thead>
          <tr>
            <th className="w-2/4">Name</th>
            <th className="w-1/4">Date Started</th>
            <th className="w-1/4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} loading />
            ))
          ) : (
            <>
              {orgApplicantRoles === null && (
                <>
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center text-xs text-gray-400 p-8 h-80"
                    >
                      There was an error getting your application data.
                    </td>
                  </tr>
                </>
              )}
              {orgApplicantRoles &&
                orgApplicantRoles.map((orgApplicantRole) => (
                  <TableRow
                    key={orgApplicantRole.organizationId._id}
                    orgApplicantRole={orgApplicantRole}
                  />
                ))}
              {orgApplicantRoles && orgApplicantRoles.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="text-center text-xs text-gray-400 p-8 h-80"
                  >
                    No applications found.
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

function TableRow({ orgApplicantRole, loading }) {
  const { organizationId, createdAt, membershipStatus, batch } = orgApplicantRole || {};

  const statuses = {
    ongoing: "badge-info",
    accepted: "badge-success",
    declined: "badge-error",
    withdrawn: "badge-warning",
  };

  return (
    <tr>
      <td>
        <div className="flex items-center space-x-3">
          <div className="avatar">
            <div
              className={`mask mask-squircle w-12 h-12 ${
                loading && "skeleton"
              }`}
            >
              {!loading && (
                <>
                  {organizationId.logo ? (
                    <img src={toBase64Src(organizationId.logo.data)} alt={organizationId.name} />
                  ) : (
                    <span className="bg-gray-200 w-12 h-12 flex items-center justify-center">
                      <BiBuilding size="1.25em" />
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          <div>
            {loading ? (
              <>
                <div className="w-48 h-4 skeleton mb-1"></div>
                <div className="w-16 h-4 skeleton"></div>
              </>
            ) : (
              <>
                <div className="font-bold">
                  {organizationId.name} ({organizationId.shortName})
                </div>
                <span
                  className={`badge ${statuses[membershipStatus]} badge-sm`}
                >
                  {membershipStatus}
                </span>
              </>
            )}
          </div>
        </div>
      </td>
      <td>
        {loading ? (
          <div className="w-48 h-4 skeleton"></div>
        ) : (
          dayjs(createdAt).format("MMM D, YYYY")
        )}
      </td>
      <th>
        {loading ? (
          <div className="w-16 h-4 skeleton"></div>
        ) : (
          <Link href={`/applications/${organizationId._id}?batch=${batch}`} className="btn btn-ghost btn-xs">
            view
          </Link>
        )}
      </th>
    </tr>
  );
}
