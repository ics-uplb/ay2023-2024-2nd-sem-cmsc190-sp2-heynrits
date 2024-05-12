import { useContext, useState } from "react";
import { useParams } from "next/navigation";

import Organization from "@/utils/api/organization";
import { OrganizationContext } from "@/context/OrganizationContext";
import { SystemFeedbackContext } from "@/context/SystemFeedbackContext";

import {
  BiBriefcaseAlt,
  BiCheck,
  BiPen,
  BiShieldQuarter,
  BiTrash,
  BiUser,
  BiX,
  BiMailSend,
} from "react-icons/bi";
import AddNewMemberFragment from "./AddNewMemberFragment";
import ConfirmationDialog from "@/components/ConfirmationDialog";

const designations = ["member", "officer", "admin"];

export default function AllMembersTable({ state, searchFilter }) {
  const [addingMember, setAddingMember] = state;
  const [editingMember, setEditingMember] = useState("");
  const [deletingMember, setDeletingMember] = useState(null);

  const { members, departments, organization } =
    useContext(OrganizationContext);
  const { showMessage } = useContext(SystemFeedbackContext);

  const filterHandler = (m) =>
    `${m.userId.firstName} ${m.userId.lastName} ${m.userId.email}`
      .toLowerCase()
      .includes(searchFilter.toLowerCase());

  const onCreate = (err, data) => {
    if (err) {
      showMessage({
        type: "error",
        message: data.message,
      });
      return;
    }

    setAddingMember(false);
    members.refetch();
    departments.refetch();

    showMessage({
      type: "success",
      message: `Membership invitation sent to ${data.userId.firstName} ${data.userId.lastName} (${data.userId.email})!`,
    });
  };

  const onUpdate = (err, data) => {
    setEditingMember("");

    if (err) {
      showMessage({
        type: "error",
        message: data.message,
      });
    } else {
      showMessage({
        type: "success",
        message: `${data.firstName} ${data.lastName}'s info has been updated successfully!`,
      });

      departments.refetch();
      members.refetch();
    }
  };

  const onDelete = (err, data) => {
    setDeletingMember(null);

    if (err) {
      showMessage({
        type: "error",
        message: data.message,
      });
    } else {
      showMessage({
        type: "success",
        message: `${data.firstName} ${data.lastName} (${data.email}) has been removed from the organization.`,
      });

      members.refetch();
      departments.refetch();
    }
  };

  const removeMember = async () => {
    const member = deletingMember?.userId;
    const { _id, firstName, lastName, email } = member;
    const data = await Organization.removeMember(organization?.data?._id, _id);

    if (!data || data.message) {
      onDelete(
        true,
        data || { message: "There was a problem removing the member." }
      );
      return;
    }

    onDelete(false, member);
  };

  return (
    <div className="overflow-x-auto shadow-md rounded-sm">
      <table className="table w-full max-h-screen">
        {/* head */}
        <thead>
          <tr>
            <th className="w-2/5">Name</th>
            <th className="w-1/5">Designation</th>
            <th className="w-1/5">Department</th>
            <th className="w-1/5">Actions</th>
          </tr>
        </thead>
        <tbody>
          {addingMember && (
            <AddNewMemberFragment
              setAddingMember={setAddingMember}
              onCreate={onCreate}
            />
          )}
          {members.loading &&
            Array.from({ length: 5 }).map((_, index) => (
              <MemberTableRow key={index} loading />
            ))}

          {members.data === null && (
            <tr>
              <td colSpan={4}>
                <p className="text-center">
                  There was an error getting the members.
                </p>
              </td>
            </tr>
          )}

          {!members.loading && (
            <>
              {members.data && members.data.length > 0 ? (
                members.data
                  .filter(filterHandler)
                  .map((m) => (
                    <MemberTableRow
                      key={m.userId._id}
                      member={m}
                      isEditing={m.userId._id === editingMember}
                      setEditingMember={setEditingMember}
                      setDeletingMember={setDeletingMember}
                      onUpdate={onUpdate}
                    />
                  ))
              ) : (
                <tr className="h-96">
                  <td colSpan={4}>
                    <p className="text-center text-gray-400">No members.</p>
                  </td>
                </tr>
              )}
            </>
          )}
        </tbody>
      </table>
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        title="Remove user?"
        message={`Are you sure you want to remove ${deletingMember?.userId?.firstName} ${deletingMember?.userId?.lastName} (${deletingMember?.userId?.email}) from this organization?`}
        open={deletingMember}
        setOpen={setDeletingMember}
        onConfirm={removeMember}
        btnColor="btn-error"
        confirmText="Remove"
      />
    </div>
  );
}

function MemberTableRow({
  isEditing,
  setEditingMember,
  setDeletingMember,
  onUpdate,
  member,
  loading,
}) {
  const params = useParams();
  const { _id, firstName, lastName, email, avatar } = member?.userId || {};
  const { roles, departmentId, membershipStatus } = member || {};

  const { organization, departments, members } =
    useContext(OrganizationContext);
  const { showMessage } = useContext(SystemFeedbackContext);

  const [selectedRole, setSelectedRole] = useState(
    (roles && roles[0]) || "member"
  );
  const [selectedDept, setSelectedDept] = useState(departmentId?._id || null);

  const updateMember = async () => {
    const payload = {
      roles: [selectedRole],
      departmentId: selectedDept,
    };

    const data = await Organization.updateMember(params["orgId"], _id, payload);

    if (!data || data.message) {
      onUpdate(
        true,
        data || {
          message: `There was a problem updating ${firstName} ${lastName}'s info.`,
        }
      );
      return;
    }

    onUpdate(false, member.userId);
  };

  const [makeAdminModal, setMakeAdminModal] = useState(false);
  return (
    <>
      <tr className={`${isEditing && "border-2 border-indigo-300"}`}>
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
                    {avatar ? (
                      <img
                        className="w-12 h-12 object-cover"
                        src={avatar}
                        alt={`${firstName} ${lastName}`}
                      />
                    ) : (
                      <span className="bg-gray-200 w-12 h-12 flex items-center justify-center">
                        <BiUser size="1.25em" />
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            {loading ? (
              <span className="skeleton h-4 w-64"></span>
            ) : (
              <>
                <div>
                  <div className="font-md">
                    {`${firstName} ${lastName}`}
                    <span>
                      {roles.includes("admin") && (
                        <span className="tooltip" data-tip="Admin">
                          <span className="badge badge-outline badge-warning text-[0.6875rem] ml-2">
                            <BiShieldQuarter />
                          </span>
                        </span>
                      )}
                      {roles.includes("officer") && (
                        <span className="tooltip" data-tip="Officer">
                          <span className="badge badge-outline badge-info text-[0.6875rem] ml-2">
                            <BiBriefcaseAlt />
                          </span>
                        </span>
                      )}
                      {membershipStatus === "invited" && (
                        <span className="tooltip" data-tip="pending invitation">
                          <span className="badge badge-outline badge-success text-[0.6875rem] ml-2">
                            <BiMailSend />
                          </span>
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="text-[0.6875rem] text-gray-500">{email}</div>
                  {/* {isEditing && roles.includes("officer") && (
                    <div className="mt-2">
                      {roles.includes("admin") ? (
                        <button className="btn btn-outline btn-xs btn-error">
                          <BiShieldX size="1.25em" /> Remove admin
                        </button>
                      ) : (
                        <button
                          className="btn btn-outline btn-xs btn-warning"
                          onClick={() => setMakeAdminModal(true)}
                        >
                          <BiShieldQuarter size="1.25em" /> Make an admin
                        </button>
                      )}
                    </div>
                  )} */}
                </div>
              </>
            )}
          </div>
        </td>
        <td>
          {loading ? (
            <span className="skeleton h-4 w-32 inline-block"></span>
          ) : (
            <>
              {isEditing ? (
                <select
                  className="select select-bordered md:select-sm w-full md:max-w-xs font-normal"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option disabled>Select designation...</option>
                  {designations.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-sm text-gray-600">{roles[0]}</span>
              )}
            </>
          )}
        </td>
        <td>
          {loading ? (
            <span className="skeleton h-4 w-32 inline-block"></span>
          ) : (
            <>
              {isEditing ? (
                <select
                  className="select select-bordered md:select-sm w-full md:max-w-xs font-normal"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                >
                  <option disabled selected>
                    Assign department...
                  </option>
                  {departments.data.map((d) => (
                    <option
                      key={d}
                      value={d._id}
                      selected={d._id === departmentId?._id}
                    >
                      {d.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-sm text-gray-600">
                  {(departmentId && departmentId.name) || (
                    <span className="badge badge-md badge-ghost text-gray-600">
                      N/A
                    </span>
                  )}
                </span>
              )}
            </>
          )}
        </td>
        <td>
          {loading ? (
            <span className="skeleton h-4 w-32 inline-block"></span>
          ) : (
            <>
              {isEditing ? (
                <>
                  <button
                    className="btn btn-primary btn-xs"
                    onClick={updateMember}
                  >
                    <BiCheck size="1.25em" /> Save
                  </button>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => {
                      setEditingMember("");
                    }}
                  >
                    <BiX size="1.25em" /> Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => setEditingMember(_id)}
                  >
                    <BiPen size="1.25em" /> edit
                  </button>
                  <button
                    className="btn btn-ghost btn-xs hover:text-rose-700"
                    onClick={() => setDeletingMember(member)}
                  >
                    <BiTrash size="1.25em" /> remove
                  </button>
                </>
              )}
            </>
          )}
        </td>
      </tr>
    </>
  );
}
