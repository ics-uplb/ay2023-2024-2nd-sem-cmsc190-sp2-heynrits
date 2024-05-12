"use client";
import { useContext, useState } from "react";

import Organization from "@/utils/api/organization";
import { OrganizationContext } from "@/context/OrganizationContext";

import { BiSend, BiUser, BiX } from "react-icons/bi";

const designations = ["member", "officer", "admin"];

export default function AddNewMemberFragment({ setAddingMember, onCreate }) {
  const { organization, departments } = useContext(OrganizationContext);

  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("member");
  const [selectedDept, setSelectedDept] = useState("");

  const inviteMember = async () => {
    const payload = {
      email,
      roles: [selectedRole],
      departmentId: selectedDept ? selectedDept : null,
    };

    const data = await Organization.inviteMember(organization.data._id, payload);

    if (!data || data.message) {
      onCreate(
        true,
        data || { message: "There was a problem inviting the member." }
      );
      return;
    }

    onCreate(false, data);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="block md:hidden fixed bg-black opacity-50 top-0 left-0 right-0 bottom-0 z-[9]"
        onClick={() => setAddingMember(false)}
      ></div>

      {/* Row/Modal */}
      <tr className="fixed md:relative top-1/2 -translate-y-1/2 md:translate-y-0 left-1/2 -translate-x-1/2 z-10 bg-white w-full max-w-md md:border-2 md:border-indigo-300 flex md:table-row flex-col shadow-xl md:shadow-none p-4 md:p-0">
        <td className="block md:hidden">
          <div className="text-lg font-bold">Invite a member</div>
        </td>
        <td>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3 w-full">
              <div className="avatar">
                <div className="mask mask-squircle w-16 md:w-12 h-16 md:h-12">
                  <span className="bg-gray-100 md:bg-gray-200 w-16 md:w-12 h-16 md:h-12 flex items-center justify-center">
                    <BiUser size="1.25em" />
                  </span>
                </div>
              </div>
              <div className="flex-grow">
                <div className="font-md w-full">
                  <input
                    autoFocus
                    type="text"
                    name="email"
                    id="email"
                    placeholder="Email address"
                    className="input input-bordered md:input-sm w-full md:w-72"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </td>
        <td>
          <select
            className="select select-bordered md:select-sm w-full md:max-w-xs font-normal"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option disabled>Select designation...</option>
            {designations.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </td>
        <td>
          <select
            className="select select-bordered md:select-sm w-full md:max-w-xs font-normal"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option disabled selected value="">
              Assign department...
            </option>
            {departments.data.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </td>
        <td>
          <div className="flex flex-row-reverse md:flex-row items-center justify-start gap-3">
            <button
              className="btn btn-primary btn-sm md:btn-xs"
              onClick={inviteMember}
              disabled={email.length === 0}
            >
              <BiSend size="1.25em" /> Invite
            </button>
            <button
              className="btn btn-ghost btn-sm md:btn-xs"
              onClick={() => setAddingMember(false)}
            >
              <BiX size="1.25em" /> Cancel
            </button>
          </div>
        </td>
      </tr>
    </>
  );
}
