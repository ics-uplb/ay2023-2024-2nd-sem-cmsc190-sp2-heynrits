import { forwardRef } from "react";
import { BiQuestionMark, BiTrashAlt, BiUser } from "react-icons/bi";
import InterviewAssignments from "./InterviewAssignments";

const ApplicantDetailsModal = forwardRef(
  ({ applicant, setApplicant, editable }, ref) => {
    const isConfirmed =
      applicant?.roles.includes("applicant") &&
      ["confirmed", "accepted", "rejected"].includes(
        applicant?.membershipStatus
      );
    const isInvited =
      applicant?.roles.includes("applicant") &&
      applicant?.membershipStatus === "invited";

    return (
      <dialog
        id="my_modal_2"
        className={`modal ${applicant !== null && "modal-open"}`}
        ref={ref}
      >
        <div className="modal-box max-w-[70rem] h-[90vh]">
          <form method="dialog" onSubmit={() => setApplicant(null)}>
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">Applicant Details</h3>

          {/* Modal Body */}
          <div className="mt-4">
            <div className="flex items-center gap-x-3 w-full mb-8">
              <div className="avatar">
                <div className="mask mask-squircle w-12 h-12">
                  {/* Confirmed Applicants */}
                  {isConfirmed && (
                    <>
                      {applicant?.userId.avatar ? (
                        <img
                          className="w-12 h-12 object-cover"
                          src={applicant.userId.avatar}
                          alt={
                            applicant.userId.firstName +
                            " " +
                            applicant.userId.lastName
                          }
                        />
                      ) : (
                        <span className="bg-gray-200 w-12 h-12 flex items-center justify-center">
                          <BiUser size="1.25em" />
                        </span>
                      )}
                    </>
                  )}
                  {/* Pending Confirmation Applicants */}
                  {isInvited && (
                    <span className="bg-gray-200 w-12 h-12 flex items-center justify-center">
                      <BiQuestionMark size="1.25em" />
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="font-md">
                  {applicant?.userId.firstName} {applicant?.userId.lastName}
                </div>
                <div className="text-[0.6875rem] text-gray-500">
                  {applicant?.userId.email}
                </div>
              </div>
              {isInvited && (
                <button className="btn btn-outline btn-error btn-sm ml-auto">
                  <BiTrashAlt /> Cancel Invitation
                </button>
              )}
            </div>

            {isConfirmed ? (
              <InterviewAssignments editable={editable} applicant={applicant} />
            ) : (
              <div className="alert mt-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-info shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span className="text-xs">
                  Please wait for the applicant confirmation before assigning
                  interviewers.
                </span>
              </div>
            )}
          </div>
        </div>
        <form
          method="dialog"
          className="modal-backdrop"
          onSubmit={() => setApplicant(null)}
        >
          <button>close</button>
        </form>
      </dialog>
    );
  }
);

ApplicantDetailsModal.displayName = "ApplicantDetailsModal";

export default ApplicantDetailsModal;
