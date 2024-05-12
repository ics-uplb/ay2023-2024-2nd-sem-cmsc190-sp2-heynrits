import { useContext, useState } from "react";

import { OrganizationContext } from "@/context/OrganizationContext";
import { SystemFeedbackContext } from "@/context/SystemFeedbackContext";

import {
  BiPen,
  BiQuestionMark,
  BiTrash,
  BiUser,
  BiMailSend,
  BiShow,
} from "react-icons/bi";
import { GrDrawer } from "react-icons/gr";
import ApplicantDetailsModal from "./ApplicantDetailsModal";
import AddNewApplicantFragment from "./AddNewApplicantFragment";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import Organization from "@/utils/api/organization";

export default function AllApplicantsTable({
  isArchived,
  state,
  searchFilter,
}) {
  const [addingApplicant, setAddingApplicant] = state;
  const [editingApplicant, setEditingApplicant] = useState(null);
  const [deletingApplicant, setDeletingApplicant] = useState(null);

  const { applicants, organization, selectedBatch } =
    useContext(OrganizationContext);
  const { showMessage } = useContext(SystemFeedbackContext);

  console.log({ applicants: applicants.data });
  const filterHandler = (a) =>
    `${a.userId.firstName} ${a.userId.lastName} ${a.userId.email}`
      .toLowerCase()
      .includes(searchFilter.toLowerCase());

  const onCreate = (error, data) => {
    if (error) {
      showMessage({
        type: "error",
        message: data.message,
      });
      return;
    }

    setAddingApplicant(false);
    applicants.refetch();

    showMessage({
      type: "success",
      message: `Applicant invitation has been sent to ${data.userId.firstName} ${data.userId.lastName} (${data.userId.email})!`,
    });
  };

  const removeApplicant = async () => {
    const applicant = deletingApplicant?.userId;
    const data = await Organization.removeOrgApplicant(
      organization.data._id,
      selectedBatch,
      applicant._id
    );

    console.log({ data });
    if (!data || data.message) {
      onDelete(
        true,
        data || { message: "There was a problem removing the applicant." }
      );
      return;
    }

    onDelete(false, applicant);
  };

  const onDelete = (err, data) => {
    if (err) {
      showMessage({
        type: "error",
        message: data.message,
      });
      return;
    }

    setDeletingApplicant(null);
    applicants.refetch();

    showMessage({
      type: "success",
      message: `${data.firstName} ${data.lastName} (${data.email}) has been removed from the list of applicants.`,
    });
  };

  return (
    <div className="overflow-x-auto shadow-md rounded-sm">
      <ApplicantDetailsModal
        editable={!isArchived}
        setApplicant={setEditingApplicant}
        applicant={editingApplicant}
      />
      <table className="table w-full max-h-screen">
        {/* head */}
        <thead>
          <tr>
            <th className="w-4/6">Name</th>
            <th className="w-2/6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {addingApplicant && (
            <AddNewApplicantFragment
              setAddingApplicant={setAddingApplicant}
              onCreate={onCreate}
            />
          )}
          {applicants.loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <ApplicantTableRow key={i} loading />
              ))
            : applicants.data &&
              applicants.data
                .filter(filterHandler)
                .map((applicant) => (
                  <ApplicantTableRow
                    editable={!isArchived}
                    key={applicant._id}
                    applicant={applicant}
                    setEditingApplicant={setEditingApplicant}
                    setDeletingApplicant={setDeletingApplicant}
                  />
                ))}
          {/* Error */}
          {applicants.data === null && !applicants.loading && (
            <tr>
              <td colSpan={2} className="text-center text-xs text-gray-400 p-8">
                There was a problem loading the applicants.
              </td>
            </tr>
          )}
          {/* No data */}
          {applicants.data &&
            applicants.data.length === 0 &&
            !applicants.loading &&
            !addingApplicant && (
              <tr>
                <td
                  colSpan={2}
                  className="text-center text-xs text-gray-400 p-8 h-80"
                >
                  <span className="flex flex-col gap-4 items-center">
                    <GrDrawer size="1.5rem" />
                    <span>
                      No applicants yet. Click &quot;Add New&quot; to start.
                    </span>
                  </span>
                </td>
              </tr>
            )}

          {/* No search result */}
          {applicants.data &&
            applicants.data.length > 0 &&
            searchFilter.length > 0 &&
            applicants.data.filter(filterHandler).length === 0 && (
              <tr>
                <td
                  colSpan={2}
                  className="text-center text-xs text-gray-400 p-8"
                >
                  No applicant matches &quot;{searchFilter}&quot;.
                </td>
              </tr>
            )}
        </tbody>
      </table>
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        title="Remove applicant?"
        message={`Are you sure you want to remove ${deletingApplicant?.userId?.firstName} ${deletingApplicant?.userId?.lastName} (${deletingApplicant?.userId?.email}) from the list of applicants?`}
        open={deletingApplicant}
        setOpen={setDeletingApplicant}
        onConfirm={removeApplicant}
        btnColor="btn-error"
        confirmText="Remove"
      />
    </div>
  );
}

function ApplicantTableRow({
  editable,
  setDeletingApplicant,
  setEditingApplicant,
  applicant,
  loading,
}) {
  const { _id, userId, membershipStatus } = applicant || {};
  const { firstName, lastName, email, avatar } = userId || {};

  return (
    <>
      <tr>
        <td>
          <div className="flex items-center space-x-3">
            <div className="avatar">
              <div
                className={`mask mask-squircle ${
                  loading && "skeleton"
                } w-12 h-12`}
              >
                {!loading && (
                  <>
                    {/* Confirmed Applicants */}
                    {(membershipStatus === "confirmed" ||
                      membershipStatus === "accepted") && (
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
                    {/* Pending Confirmation Applicants */}
                    {membershipStatus === "invited" && (
                      <span className="bg-gray-200 w-12 h-12 flex items-center justify-center">
                        <BiQuestionMark size="1.25em" />
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            <div>
              {loading ? (
                <>
                  <div className="skeleton w-24 h-4 mb-1"></div>
                  <div className="skeleton w-24 h-4"></div>
                </>
              ) : (
                <>
                  <div className="font-md">
                    <span>
                      {firstName} {lastName}
                    </span>
                    {membershipStatus === "invited" && (
                      <span className="tooltip" data-tip="pending invitation">
                        <span className="badge badge-outline badge-success text-[0.6875rem] ml-2">
                          <BiMailSend />
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="text-[0.6875rem] text-gray-500">{email}</div>
                </>
              )}
            </div>
          </div>
        </td>
        <td className="text-right">
          {loading ? (
            <>
              <span className="inline-block skeleton w-12 h-4 mr-2"></span>
              <span className="inline-block skeleton w-12 h-4"></span>
            </>
          ) : (
            <>
              <button
                className="btn btn-ghost btn-xs"
                onClick={() => {
                  setEditingApplicant(applicant);
                }}
              >
                {editable ? (
                  <>
                    <BiPen size="1.25em" /> assign interviewers
                  </>
                ) : (
                  <>
                    <BiShow size="1.25em" /> view details
                  </>
                )}
              </button>
              {editable && (
                <button
                  className="btn btn-ghost btn-xs hover:text-rose-700"
                  onClick={() => setDeletingApplicant(applicant)}
                >
                  <BiTrash size="1.25em" /> remove
                </button>
              )}
            </>
          )}
        </td>
      </tr>
    </>
  );
}
