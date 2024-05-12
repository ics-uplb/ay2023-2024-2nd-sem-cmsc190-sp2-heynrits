"use client";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

import Organization from "@/utils/api/organization";
import { toBase64Src } from "@/utils/generic";

import { BiBuilding, BiShow, BiCog } from "react-icons/bi";
import Link from "next/link";

export default function AllOrganizationsTable({ searchFilter }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log({ data });
  const filterHandler = (o) =>
    `${o.organizationId.name}`
      .toLowerCase()
      .includes(searchFilter.toLowerCase());

  const fetchData = async () => {
    setLoading(true);

    const org = await Organization.getAll();
    setData(org);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="overflow-x-auto shadow-md rounded-sm">
      <table className="table table-auto w-full">
        {/* head */}
        <thead>
          <tr>
            <th className="w-2/4">Name</th>
            <th className="1/4">Date of Membership</th>
            <th className="1/4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index} loading />
            ))}

          {data === null && (
            <tr>
              <td colSpan={3}>
                <p className="text-center">There was an error fetching data.</p>
              </td>
            </tr>
          )}

          {!loading && (
            <>
              {data && data.length > 0 ? (
                data
                  .filter(filterHandler)
                  .map((d) => (
                    <TableRow
                      key={d.organizationId._id}
                      org={d.organizationId}
                      dateOfMembership={d.memberSince}
                      isAdmin={d.roles.includes("admin")}
                    />
                  ))
              ) : (
                <tr className="h-96">
                  <td colSpan={3}>
                    <p className="text-center text-gray-400">
                      No organization found.
                    </p>
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

function TableRow({ org = {}, dateOfMembership, isAdmin, loading }) {
  const { _id, name, logo } = org;

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
                  {logo ? (
                    <img src={toBase64Src(logo.data)} alt={name} />
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
              <div className="w-48 h-4 skeleton"></div>
            ) : (
              <div className="text-sm">{name}</div>
            )}
          </div>
        </div>
      </td>
      <td>
        {loading ? (
          <div className="w-32 h-4 skeleton"></div>
        ) : (
          <span className="text-xs">
            {dayjs(dateOfMembership).format("MMMM D, YYYY")}
          </span>
        )}
      </td>
      <th>
        {loading ? (
          <div className="w-24 h-4 skeleton"></div>
        ) : (
          <>
            <Link
              href={`/organizations/${_id}`}
              className="btn btn-ghost btn-xs"
            >
              <BiShow size="1.25em" /> view
            </Link>
            {isAdmin && (
              <Link
                href={`/organizations/${_id}/manage`}
                className="btn btn-ghost btn-xs"
              >
                <BiCog size="1.25em" /> manage
              </Link>
            )}
          </>
        )}
      </th>
    </tr>
  );
}
