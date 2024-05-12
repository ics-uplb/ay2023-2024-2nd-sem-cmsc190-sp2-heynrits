import { useContext, useState } from "react";
import { useRouter } from "next/navigation";

import Organization from "@/utils/api/organization";
import { OrganizationContext } from "@/context/OrganizationContext";
import { SystemFeedbackContext } from "@/context/SystemFeedbackContext";

import { Modal, ModalTitle, ModalBody, ModalAction } from "@/components/Modal";
import Alert from "@/components/Alert";

export default function CreateNewBatchModal({ open, setOpen }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { batches, setSelectedBatch, organization } =
    useContext(OrganizationContext);
  const { showMessage } = useContext(SystemFeedbackContext);

  const [name, setName] = useState("");

  const createBatch = async () => {
    setLoading(true);

    const batch = await Organization.createBatch(organization.data._id, name);

    if (!batch || !batch._id) {
      setLoading(false);
      setError(batch.message || `There was an error creating batch "${name}".`);

      return;
    }

    await Organization.updatePreferences(organization.data._id, {
      batch: batch._id,
    });
    batches.refetch();

    setName("");
    setOpen(false);
    setLoading(false);

    showMessage({
      type: "success",
      message: `Batch "${name}" created and selected!`,
    });
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <ModalTitle>Create a New Batch</ModalTitle>
      {loading ? (
        <ModalBody>
          <div className="flex flex-col items-center gap-4 py-16">
            <span className="loading loading-ring loading-lg text-primary"></span>
            <p className="text-xs text-gray-500">Creating "{name}"...</p>
          </div>
        </ModalBody>
      ) : (
        <>
          <ModalBody>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text text-gray-600 text-xs">
                  Batch Name
                </span>
              </label>
              <input
                autoFocus
                type="text"
                placeholder="Batch Name"
                className="input input-bordered"
                onKeyDown={(e) => e.key === "Enter" && createBatch()}
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            </div>

            {/* show an alert if there is an error */}
            {error && (
              <Alert type="error" message={error} className="shadow-sm mt-4" />
            )}
          </ModalBody>
          <ModalAction>
            <button className="btn" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={createBatch}
              disabled={!name}
            >
              Create
            </button>
          </ModalAction>
        </>
      )}
    </Modal>
  );
}
