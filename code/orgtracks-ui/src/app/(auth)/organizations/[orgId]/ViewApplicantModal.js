import dayjs from "dayjs";
import { useEffect, useState, useContext } from "react";

import application from "@/utils/api/application";

import { SystemFeedbackContext } from "@/context/SystemFeedbackContext";
import { AuthContext } from "@/context/AuthContext";
import { SocketContext } from "@/context/SocketContext";

import {
  BiCalendarAlt,
  BiComment,
  BiCalendarCheck,
  BiCalendarEvent,
  BiCalendarExclamation,
  BiCalendarX,
  BiCheck,
  BiChevronDown,
  BiErrorCircle,
  BiUser,
  BiPencil,
  BiEditAlt,
  BiTrashAlt,
  BiLockAlt,
  BiGroup,
} from "react-icons/bi";
import { CiRead } from "react-icons/ci";

const visibilityTooltips = {
  both: "This feedback will be visible to both the applicant and the organization memberrs.",
  organization:
    "This feedback will only be visible to the organization members and not to the applicant.",
};

const visibilityTooltips2 = {
  both: "This feedback is visible to both applicant and organization memberrs.",
  organization: "This feedback is only visible to the organization members.",
};

const InterviewerFeedback = ({
  loading,
  interviewAssignmentId,
  interviewerFeedback,
  editable,
  onUpdate,
  onDelete,
}) => {
  const [editing, setEditing] = useState(false);
  const [updatedContent, setUpdatedContent] = useState(
    interviewerFeedback && interviewerFeedback.content
  );
  const [updatedVisibility, setUpdatedVisibility] = useState(
    interviewerFeedback && interviewerFeedback.visibility
  );

  return (
    <div
      className={`${
        !editing && "group"
      } flex items-start gap-4 hover:bg-gray-100 py-2 rounded-md`}
    >
      {loading ? (
        <>
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 skeleton"></div>
          <div className="flex-1">
            <div className="w-32 h-4 mb-2 skeleton"></div>
            <div className="w-96 h-4 mb-1 skeleton"></div>
            <div className="w-96 h-4 skeleton"></div>
          </div>
        </>
      ) : (
        <>
          {interviewerFeedback.interviewer.avatar ? (
            <img
              src={interviewerFeedback.interviewer.avatar}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200">
              <BiUser size="1.25em" />
            </div>
          )}
          <div className="flex-1">
            <p className="font-bold text-xs flex flex-col gap-1">
              <span>
                {interviewerFeedback.interviewer.firstName}{" "}
                {interviewerFeedback.interviewer.lastName}
              </span>
              <span className="text-xs text-gray-400 font-normal flex gap-1">
                <span
                  className="tooltip tooltip-right flex gap-1"
                  data-tip={visibilityTooltips2[interviewerFeedback.visibility]}
                >
                  <BiGroup />{" "}
                  {interviewerFeedback.visibility === "both" ? (
                    <BiUser className="inline" />
                  ) : (
                    <BiLockAlt />
                  )}
                </span>{" "}
                &middot;{" "}
                {dayjs(interviewerFeedback.updatedAt).format(
                  "MMM D, YYYY [at] h:mm a"
                )}{" "}
              </span>
            </p>
            {editing ? (
              <label className="form-control">
                <div className="label">
                  <span className="flex flex-row gap-2 text-xs font-bold">
                    <BiPencil size="1.25em" /> Edit note
                  </span>
                </div>
                <textarea
                  className="textarea textarea-bordered h-24 text-xs py-4"
                  placeholder="Write a note here."
                  value={updatedContent}
                  onChange={(e) => setUpdatedContent(e.target.value)}
                ></textarea>
                <div className="flex w-full justify-end mt-4 gap-2">
                  <div className="flex items-center gap-2 mr-auto">
                    <div className="tooltip" data-tip="Note visibility">
                      <CiRead />
                    </div>
                    <div
                      className="tooltip"
                      data-tip={visibilityTooltips[updatedVisibility]}
                    >
                      <select
                        className="text-xs"
                        value={updatedVisibility}
                        onChange={(e) => setUpdatedVisibility(e.target.value)}
                      >
                        <option value="both">Org Members and Applicant</option>
                        <option value="organization">
                          Organization Members Only
                        </option>
                      </select>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary btn-outline btn-sm"
                    onClick={() => {
                      setUpdatedContent(interviewerFeedback.content);
                      setEditing(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() =>
                      onUpdate(interviewAssignmentId, interviewerFeedback._id, {
                        content: updatedContent,
                        visibility: updatedVisibility,
                      })
                    }
                    disabled={updatedContent.length === 0}
                  >
                    Save
                  </button>
                </div>
              </label>
            ) : (
              <pre className="font-sans text-xs mt-1.5">
                {interviewerFeedback.content}
              </pre>
            )}
          </div>
          {editable && (
            <div
              className={`hidden ${
                !editing && "group-hover:block"
              } text-gray-600`}
            >
              <div
                class="tooltip"
                data-tip="Delete"
                onClick={() =>
                  onDelete(interviewAssignmentId, interviewerFeedback._id)
                }
              >
                <button className="btn btn-square btn-sm btn-ghost">
                  <BiTrashAlt />
                </button>
              </div>
              <div
                class="tooltip"
                data-tip="Edit"
                onClick={() => setEditing(true)}
              >
                <button className="btn btn-square btn-sm btn-ghost">
                  <BiEditAlt />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const ViewApplicantModal = ({
  open,
  setOpen,
  interviewAssignment,
  actionHandler,
  hasEvaluated,
}) => {
  const { showMessage } = useContext(SystemFeedbackContext);
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const [status, setStatus] = useState("loaded");
  const [allNotes, setAllNotes] = useState([]);

  const [noteVisibility, setNoteVisibility] = useState("both");
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false); // loading status

  const [selectedNote, setSelectedNote] = useState(null);
  const [updatedNote, setUpdatedNote] = useState("");
  const [updatingNote, setUpdatingNote] = useState(false); // loading status
  const [deletingNote, setDeletingNote] = useState(false); // loading status

  const addNote = async () => {
    setSavingNote(true);

    const note = await application.addFeedback(interviewAssignment._id, {
      content: newNote,
      visibility: noteVisibility,
    });

    setSavingNote(false);

    if (!note) {
      showMessage({
        type: "error",
        message: "There was an error saving this note.",
      });
    } else {
      setAllNotes((n) => [...n, note]);
      setNewNote("");
    }
  };

  const updateNote = async (
    interviewAssignmentId,
    interviewerFeedbackId,
    payload
  ) => {
    setUpdatingNote(true);

    const note = await application.updateFeedback(
      interviewAssignmentId,
      interviewerFeedbackId,
      payload
    );

    setUpdatingNote(false);

    if (!note) {
      showMessage({
        type: "error",
        message: "There was an error updating this note.",
      });
    } else {
      setUpdatedNote("");
      fetchFeedback(interviewAssignment);
    }
  };

  const removeNote = async (interviewAssignmentId, interviewerFeedbackId) => {
    const confirmation = confirm("Are you sure?");
    if (!confirmation) return;

    setDeletingNote(true);

    const note = await application.removeFeedback(
      interviewAssignmentId,
      interviewerFeedbackId
    );

    setDeletingNote(false);

    if (!note) {
      showMessage({
        type: "error",
        message: "There was an error deleting this note.",
      });
    } else {
      showMessage({
        type: "success",
        message: "Note deleted.",
      });
      fetchFeedback(interviewAssignment);
    }
  };

  async function fetchFeedback(interviewAssignment) {
    if (!interviewAssignment) return;

    setStatus("loading");

    const feedback = await application.getAllFeedback(interviewAssignment._id);

    if (feedback) {
      setAllNotes(feedback);
      setStatus("loaded");
    } else {
      setStatus("error");
    }

    return;
  }

  useEffect(() => {
    fetchFeedback(interviewAssignment);
  }, [interviewAssignment]);

  useEffect(() => {
    if (socket) {
      socket.on("interviewer-feedback", (interviewerFeedback) => {
        const sameBatch =
          interviewAssignment &&
          interviewAssignment.batchId.toString() ===
            interviewerFeedback.batch.toString();

        const sameApplicant =
          interviewAssignment &&
          interviewAssignment.applicantId._id.toString() ===
            interviewerFeedback.applicant._id.toString();

        if (sameBatch && sameApplicant) {
          fetchFeedback(interviewAssignment);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("interviewer-feedback");
      }
    };
  }, [socket, interviewAssignment]);

  return (
    interviewAssignment && (
      <dialog id="my_modal_2" className={`modal ${open && "modal-open"}`}>
        <div className="modal-box max-w-[80rem] h-[90vh] p-12">
          <form method="dialog" onSubmit={() => setOpen(null)}>
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>

          {/* Header */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              {interviewAssignment.applicantId.avatar ? (
                <img
                  src={interviewAssignment.applicantId.avatar}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <span className="bg-gray-200 w-12 h-12 rounded-full flex items-center justify-center">
                  <BiUser size="1.25em" />
                </span>
              )}
              <div className="flex flex-col">
                <p className="font-bold">
                  {interviewAssignment.applicantId.firstName}{" "}
                  {interviewAssignment.applicantId.lastName}
                </p>
                <p className="text-xs text-gray-400">
                  {interviewAssignment.applicantId.email}
                </p>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-600 uppercase">
                Reporting Status
              </div>
              <div className="dropdown dropdown-end">
                <label
                  disabled={hasEvaluated}
                  tabIndex={0}
                  className={`m-1 btn btn-sm btn-outline btn-primary ${
                    interviewAssignment.status === "unscheduled" &&
                    "btn-disabled"
                  }`}
                >
                  {interviewAssignment.status === "unscheduled" && (
                    <BiCalendarAlt size="1.25em" />
                  )}
                  {interviewAssignment.status === "requested" && (
                    <BiCalendarExclamation size="1.25em" />
                  )}
                  {interviewAssignment.status === "scheduled" && (
                    <BiCalendarEvent size="1.25em" />
                  )}
                  {interviewAssignment.status === "done" && (
                    <BiCalendarCheck size="1.25em" />
                  )}
                  {interviewAssignment.status.toUpperCase()} <BiChevronDown />
                </label>
                {interviewAssignment.status !== "unscheduled" && (
                  <ul
                    tabIndex={0}
                    className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-64 border-gray-200 border"
                  >
                    {interviewAssignment.status === "scheduled" ||
                      (interviewAssignment.status === "requested" && (
                        <>
                          <div className="p-4 flex flex-col text-sm text-gray-700">
                            <span>
                              {dayjs(
                                interviewAssignment.appointment.dtStart
                              ).format("ddd, MMM D, YYYY")}
                            </span>
                            <span>
                              at{" "}
                              {dayjs(
                                interviewAssignment.appointment.dtStart
                              ).format("h:mm A")}{" "}
                              to{" "}
                              {dayjs(
                                interviewAssignment.appointment.dtEnd
                              ).format("h:mm A")}
                            </span>
                          </div>
                        </>
                      ))}

                    {interviewAssignment.status === "requested" && (
                      <>
                        <li>
                          <a
                            className="text-green-600 hover:bg-green-200"
                            onClick={() =>
                              actionHandler.onAccept(interviewAssignment._id)
                            }
                          >
                            <BiCalendarEvent size="1.25em" />
                            Accept
                          </a>
                        </li>
                        <li>
                          <a
                            className="text-red-600 hover:bg-red-200"
                            onClick={() =>
                              actionHandler.onDecline(interviewAssignment._id)
                            }
                          >
                            <BiCalendarX size="1.25em" />
                            Decline
                          </a>
                        </li>
                      </>
                    )}

                    {interviewAssignment.status === "scheduled" && (
                      <>
                        <li>
                          <a
                            className="text-green-600 hover:bg-green-200"
                            onClick={() =>
                              actionHandler.onMarkDone(interviewAssignment._id)
                            }
                          >
                            <BiCheck size="1.25em" />
                            Mark as Done
                          </a>
                        </li>
                        <li>
                          <a
                            className="text-red-600 hover:bg-red-200"
                            onClick={() =>
                              actionHandler.onCancel(interviewAssignment._id)
                            }
                          >
                            <BiCalendarX size="1.25em" />
                            Cancel Appointment
                          </a>
                        </li>
                      </>
                    )}

                    {interviewAssignment.status === "done" && (
                      <>
                        <li>
                          <a
                            className="text-amber-600 hover:bg-amber-200"
                            onClick={() =>
                              actionHandler.onMarkScheduled(
                                interviewAssignment._id
                              )
                            }
                          >
                            <BiCalendarEvent size="1.25em" />
                            Revert to scheduled
                          </a>
                        </li>
                      </>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="mt-4">
            {/* <h3 className="text-sm font-bold mb-2">About the Applicant</h3>
            <p className="text-sm text-gray-600 leading-6">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Assumenda ex illo modi eum perferendis tempora quo molestias
              impedit nesciunt nostrum nam ipsa id obcaecati, non ipsum fugiat,
              tenetur ut mollitia quod in.
            </p> */}

            <h3 className="text-sm font-bold mt-6 mb-2 text-primary">Notes</h3>
            <div className="flex flex-col gap-4 mt-4">
              {/* Interviewer Feedback */}
              {status === "loading" && (
                <>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <InterviewerFeedback key={index} loading />
                  ))}

                  {!hasEvaluated && (
                    <>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full skeleton"></div>
                        <div className="flex-1 h-24 skeleton"></div>
                      </div>
                      <div className="w-full flex justify-end">
                        <div className="w-16 h-8 skeleton"></div>
                      </div>
                    </>
                  )}
                </>
              )}
              {status === "loaded" && (
                <>
                  {allNotes.length === 0 ? (
                    <div className="w-full h-80 border-2 rounded-md border-gray-200 flex flex-col items-center justify-center text-gray-500 gap-2">
                      <BiComment size="1.25rem" />
                      <span className="text-xs">
                        No notes yet. Start adding one!
                      </span>
                    </div>
                  ) : (
                    <>
                      {allNotes.map((note, index) => (
                        <InterviewerFeedback
                          key={index}
                          interviewAssignmentId={interviewAssignment._id}
                          interviewerFeedback={note}
                          editable={
                            user &&
                            user._id === note.interviewer._id &&
                            !hasEvaluated
                          }
                          onUpdate={updateNote}
                          onDelete={removeNote}
                        />
                      ))}
                    </>
                  )}

                  {!hasEvaluated && (
                    <div className="flex items-start gap-4 w-full">
                      <div className="mt-8 w-10 h-10 rounded-full flex items-center justify-center bg-gray-200">
                        {user && user.avatar ? (
                          <img
                            src={user && user.avatar}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <BiUser size="1.25em" />
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="form-control">
                          <div className="label">
                            <span className="flex flex-row gap-2 text-xs font-bold">
                              <BiPencil size="1.25em" /> Add a note
                            </span>
                          </div>
                          <textarea
                            className="textarea textarea-bordered h-24 text-xs py-4"
                            placeholder="Write a note here."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                          ></textarea>
                          <div className="flex w-full justify-between mt-4 gap-2">
                            <div className="flex items-center gap-2">
                              <div
                                className="tooltip"
                                data-tip="Note visibility"
                              >
                                <CiRead />
                              </div>
                              <div
                                className="tooltip"
                                data-tip={visibilityTooltips[noteVisibility]}
                              >
                                <select
                                  className="text-xs"
                                  value={noteVisibility}
                                  onChange={(e) =>
                                    setNoteVisibility(e.target.value)
                                  }
                                >
                                  <option value="both">
                                    Org Members and Applicant
                                  </option>
                                  <option value="organization">
                                    Organization Members Only
                                  </option>
                                </select>
                              </div>
                            </div>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={addNote}
                              disabled={newNote.length === 0}
                            >
                              Save
                            </button>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <form
          method="dialog"
          className="modal-backdrop"
          onSubmit={() => setOpen(null)}
        >
          <button>close</button>
        </form>
      </dialog>
    )
  );
};

export default ViewApplicantModal;
