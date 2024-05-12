"use client";

import { useContext, useState } from "react";
import { useParams } from "next/navigation";

import Organization from "@/utils/api/organization";

import { OrganizationContext } from "@/context/OrganizationContext";
import { SystemFeedbackContext } from "@/context/SystemFeedbackContext";

import { BiCheck, BiPen, BiTrash, BiX } from "react-icons/bi";
import { GrDrawer } from "react-icons/gr";
import CreateNewDepartmentFragment from "./CreateNewDepartmentFragment";
import ConfirmationDialog from "@/components/ConfirmationDialog";

export default function AllDepartmentsTable({ state, searchFilter }) {
  const params = useParams();

  const { departments, members } = useContext(OrganizationContext);

  const [creatingDept, setCreatingDept] = state;
  const [editingDept, setEditingDept] = useState("");
  const [deletingDept, setDeletingDept] = useState("");

  const { showMessage } = useContext(SystemFeedbackContext);

  const filterHandler = (d) => `${d.name}`.toLowerCase().includes(searchFilter.toLowerCase());

  const onCreate = (err, data) => {
    if (err) {
      showMessage({
        type: "error",
        message: data.message,
      });
    } else {
      showMessage({
        type: "success",
        message: `Department "${data.name}" created successfully!`,
      });
      departments.refetch();
      members.refetch();
    }
  };
  const onUpdate = (err, data) => {
    if (err) {
      showMessage({
        type: "error",
        message: data.message,
      });
    } else {
      showMessage({
        type: "success",
        message: `"${data.name}" department updated successfully!`,
      });
      departments.refetch();
      members.refetch();
    }
  };

  const onDelete = (err, data) => {
    setDeletingDept("");
    if (err) {
      showMessage({
        type: "error",
        message: data.message,
      });
    } else {
      showMessage({
        type: "success",
        message: `"${data.name}" department deleted successfully!`,
      });
      departments.refetch();
      members.refetch();
    }
  };

  const deleteDepartment = async () => {
    const data = await Organization.removeDepartment(
      params["orgId"],
      deletingDept._id
    );

    if (!data || data.message) {
      onDelete(
        true,
        data || { message: "There was a problem deleting the department." }
      );
      return;
    }

    onDelete(false, data);
  };

  return (
    <div className="overflow-x-auto shadow-md rounded-sm">
      <table className="table w-full max-h-screen">
        {/* head */}
        <thead>
          <tr>
            <th className="w-2/5">Name</th>
            <th className="w-1/5">Department Size</th>
            <th className="w-1/5">Actions</th>
          </tr>
        </thead>
        <tbody>
          {creatingDept && (
            <CreateNewDepartmentFragment
              setAddingDept={setCreatingDept}
              onCreate={onCreate}
            />
          )}
          {departments.loading &&
            Array.from({ length: 5 }).map((_, index) => (
              <DepartmentTableRow key={index} loading />
            ))}

          {departments.data === null && (
            <tr className="h-56">
              <td colSpan={3} className="text-center">
                There was a problem getting the departments.
              </td>
            </tr>
          )}

          {departments.data && Object.keys(departments.data).includes("message") && (
            <tr className="h-56">
              <td colSpan={3} rowSpan={5} className="text-center">
                {departments.data.message}
              </td>
            </tr>
          )}

          {!departments.loading && (
            <>
              {departments.data && departments.data.length > 0 ? (
                departments.data.filter(filterHandler).map((d) => (
                  <DepartmentTableRow
                    key={d._id}
                    department={d}
                    isEditing={d._id === editingDept}
                    setEditingDept={setEditingDept}
                    setDeletingDept={setDeletingDept}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    orgId={params["orgId"]}
                  />
                ))
              ) : (
                <tr className="h-56">
                  <td colSpan={3} rowSpan={5} className="text-center">
                  <span className="flex flex-col gap-4 items-center text-gray-400">
                    <GrDrawer size="1.5rem" />
                    <span className="text-xs">
                      No departments. Click &quot;Create New&quot; to start.
                    </span>
                  </span>
                  </td>
                </tr>
              )}
            </>
          )}
        </tbody>
      </table>
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        title="Delete Department?"
        message={`Are you sure you want to delete "${deletingDept?.name}" department? All member assignments in this department will be also removed.`}
        open={deletingDept}
        setOpen={setDeletingDept}
        onConfirm={deleteDepartment}
        btnColor="btn-error"
        confirmText="Delete"
      />
    </div>
  );
}

function DepartmentTableRow({
  orgId,
  isEditing,
  setEditingDept,
  department,
  loading,
  onUpdate,
  setDeletingDept,
}) {
  const { _id, name, size } = department || {};

  const [newName, setNewName] = useState(name);

  const updateDepartment = async () => {
    const data = await Organization.updateDepartment(orgId, _id, newName);

    if (!data || data.message) {
      onUpdate(
        true,
        data || { message: "There was a problem updating the department." }
      );
      return;
    }

    onUpdate(false, data);
    setEditingDept(false);
  };

  return (
    <>
      <tr className={`${isEditing && "border-2 border-indigo-300"}`}>
        <td>
          {isEditing ? (
            <input
              autoFocus
              type="text"
              name="name"
              id="name"
              placeholder="Department name"
              className="input input-bordered md:input-sm w-full md:w-72"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          ) : loading ? (
            <span className="skeleton h-4 w-64 inline-block"></span>
          ) : (
            name
          )}
        </td>
        <td>
          {loading ? (
            <span className="skeleton h-4 w-16 inline-block"></span>
          ) : (
            size
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
                    onClick={updateDepartment}
                  >
                    <BiCheck size="1.25em" /> Save
                  </button>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => {
                      setEditingDept("");
                      setNewName(name);
                    }}
                  >
                    <BiX size="1.25em" /> Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => setEditingDept(_id)}
                  >
                    <BiPen size="1.25em" /> edit
                  </button>
                  <button
                    className="btn btn-ghost btn-xs hover:text-rose-700"
                    onClick={() => setDeletingDept(department)}
                  >
                    <BiTrash size="1.25em" /> delete
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
