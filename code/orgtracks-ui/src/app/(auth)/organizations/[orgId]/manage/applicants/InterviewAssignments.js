import { useContext, useEffect, useState } from "react";

import Organization from "@/utils/api/organization";

import { OrganizationContext } from "@/context/OrganizationContext";
import { SystemFeedbackContext } from "@/context/SystemFeedbackContext";

import { BiPen, BiSave, BiUser } from "react-icons/bi";

export default function InterviewAssignments({ applicant, editable }) {
  const { organization, departments, members, selectedBatch } =
    useContext(OrganizationContext);
  const { showMessage } = useContext(SystemFeedbackContext);

  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [newSelectedMembers, setNewSelectedMembers] = useState([]);
  const [editing, setEditing] = useState(false);

  const filterHandler = (memRole) => {
    const memberName = `${memRole.userId.firstName} ${memRole.userId.lastName}`;
    return (
      (departmentFilter === "All Departments" ||
        memRole.departmentId?._id === departmentFilter) &&
      (searchFilter.length === 0 ||
        memberName.toLowerCase().includes(searchFilter.toLowerCase()))
    );
  };

  const assignInterviews = async (applicantId, memberIds) => {
    const data = await Organization.assignInterviews(
      organization.data._id,
      selectedBatch,
      applicantId,
      { memberIds }
    );

    if (!data || data.message) {
      showMessage({
        type: "error",
        message:
          data.message ||
          "There was an error while assigning interviews with the applicant.",
      });
      return;
    }

    showMessage({
      type: "success",
      message: "Interviews assigned successfully!",
    });

    setSelectedMembers(newSelectedMembers);
    setEditing(false);
    setSearchFilter("");
    setDepartmentFilter("All Departments");
  };

  const fetchInterviewAssignments = async () => {
    const data = await Organization.getInterviewAssignmentsOfApplicant(
      organization.data._id,
      selectedBatch,
      applicant.userId._id
    );

    if (!data || data.message) {
      showMessage({
        type: "error",
        message:
          data.message ||
          "There was an error while fetching the interview assignments.",
      });
      return;
    }

    setSelectedMembers(data.map((a) => a.interviewerId));
  };

  useEffect(() => {
    fetchInterviewAssignments();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-bold w-72">Interview Assignments</h2>
        {editing ? (
          <div className="ml-4 w-full flex items-center justify-between">
            <div className="flex flex-1">
              <select
                className="select select-bordered select-sm w-full max-w-[12rem] font-normal"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="All Departments">All Departments</option>
                {departments.data.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                className="input input-bordered input-sm w-full max-w-[20rem] ml-4"
                placeholder="Search members"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  setEditing(false);
                  setSearchFilter("");
                  setDepartmentFilter("All Departments");
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm btn-primary mr-2"
                onClick={() => {
                  assignInterviews(applicant.userId._id, newSelectedMembers);
                }}
              >
                <BiSave size="1.5em" /> Save
              </button>
            </div>
          </div>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setEditing(true);
              setNewSelectedMembers(selectedMembers);
            }}
            disabled={!editable}
          >
            <BiPen size="1.5em" /> Edit
          </button>
        )}
      </div>
      <div className="w-full overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              {editing && <th className="w-[1%]"></th>}
              <th className="text-left">Name</th>
              <th className="text-left">Designation</th>
              <th className="text-left">Department</th>
            </tr>
          </thead>
          <tbody>
            {editing && members.data.filter(filterHandler).length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="text-center text-xs p-8 text-gray-400"
                >
                  No members found.
                </td>
              </tr>
            )}
            {editing &&
              members.data.filter(filterHandler).map((memRole) => {
                const memberName = `${memRole.userId.firstName} ${memRole.userId.lastName}`;
                return (
                  <tr key={memRole.userId._id}>
                    <td className="w-[1%]">
                      <label>
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={newSelectedMembers.some(
                            (nsm) => nsm._id === memRole.userId._id
                          )}
                          onChange={() => {
                            if (
                              newSelectedMembers.some(
                                (nsm) => nsm._id === memRole.userId._id
                              )
                            ) {
                              setNewSelectedMembers(
                                newSelectedMembers.filter(
                                  (m) => m._id !== memRole.userId._id
                                )
                              );
                            } else {
                              setNewSelectedMembers([
                                ...newSelectedMembers,
                                memRole.userId,
                              ]);
                            }
                          }}
                        />
                      </label>
                    </td>
                    <td>
                      <div className="flex items-center">
                        {memRole.userId.avatar ? (
                          <img
                            src={memRole.userId.avatar}
                            alt={memberName}
                            className="mask mask-squircle w-10 h-10 mr-2"
                          />
                        ) : (
                          <span className="mask mask-squircle mr-2 bg-gray-200 w-10 h-10 flex items-center justify-center">
                            <BiUser size="1.25em" />
                          </span>
                        )}
                        <div>
                          <p className="font-bold">{memberName}</p>
                          <p className="text-xs text-gray-400">
                            {memRole.userId.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>{memRole.roles[0]}</td>
                    <td>{memRole.departmentId?.name || "-"}</td>
                  </tr>
                );
              })}

            {!editing &&
              (selectedMembers.length > 0 ? (
                selectedMembers.map((member) => {
                  const memrow = members.data.find(
                    (m) => m.userId._id === member._id
                  );
                  console.log({ member: memrow, memberId: member });
                  const memberName = `${memrow.userId.firstName} ${memrow.userId.lastName}`;
                  if (!memrow) return null;
                  return (
                    <tr key={memrow._id}>
                      <td>
                        <div className="flex items-center">
                          {memrow.userId.avatar ? (
                            <img
                              src={memrow.userId.avatar}
                              alt={memberName}
                              className="mask mask-squircle w-10 h-10 mr-2"
                            />
                          ) : (
                            <span className="mask mask-squircle mr-2 bg-gray-200 w-10 h-10 flex items-center justify-center">
                              <BiUser size="1.25em" />
                            </span>
                          )}
                          <div>
                            <p className="font-bold">{memberName}</p>
                            <p className="text-xs text-gray-400">
                              {memrow.userId.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>{memrow.roles[0]}</td>
                      <td>{memrow.departmentId?.name || "-"}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="text-center text-xs p-8 text-gray-400"
                  >
                    Click &quot;Edit&quot; to assigning interviewers to the
                    applicants.
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
