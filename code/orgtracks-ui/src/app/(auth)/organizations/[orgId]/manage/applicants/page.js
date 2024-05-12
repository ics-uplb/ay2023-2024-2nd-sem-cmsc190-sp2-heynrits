"use client";
import { useContext, useState } from "react";

import Organization from "@/utils/api/organization";

import { OrganizationContext } from "@/context/OrganizationContext";
import { SystemFeedbackContext } from "@/context/SystemFeedbackContext";

import { BiPlus, BiSearch, BiArchiveIn } from "react-icons/bi";
import AllApplicantsTable from "./AllApplicantsTable";
import CreateNewBatchModal from "./CreateNewBatchModal";
import ConfirmationDialog from "@/components/ConfirmationDialog";

export default function MembersSettings() {
  const { showMessage } = useContext(SystemFeedbackContext);
  const [addingApplicant, setAddingApplicant] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [archivingBatch, setArchivingBatch] = useState(false);
  const { batches, selectedBatch, setSelectedBatch, organization } =
    useContext(OrganizationContext);

  const batchInfo = batches.data?.find((b) => b._id === selectedBatch);

  const archiveBatch = async () => {
    if (!selectedBatch) {
      return;
    }

    const b = await Organization.archiveBatch(
      organization.data._id,
      selectedBatch
    );
    if (!b || b.message) {
      showMessage({
        type: "error",
        message: b?.message || "There was a problem archiving the batch.",
      });
      return;
    }

    setArchivingBatch(false);
    batches.refetch();
  };

  return (
    <>
      <h4 className="text-sm text-primary">Selected batch</h4>
      <div className="flex items-center justify-between mt-1 mb-8">
        {batches.loading ? (
          <>
            <div className="skeleton h-8 w-48"></div>
            <div className="skeleton h-8 w-8 ml-2 mr-auto"></div>

            <div className="skeleton h-8 w-40"></div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <select
                className="select select-bordered md:select-sm w-48 md:max-w-xs font-normal"
                value={selectedBatch || ""}
                onChange={(e) => setSelectedBatch(e.target.value)}
              >
                <option disabled value="">
                  {batches.data && batches.data.length > 0
                    ? "Select a batch..."
                    : "Create a new batch..."}
                </option>

                {batches.data &&
                  batches.data.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.name} {batch.archived && "(archived)"}
                    </option>
                  ))}
              </select>

              <button
                className="btn btn-sm btn-primary btn-outline"
                onClick={() => setBatchModalOpen(true)}
              >
                <BiPlus size="1.25em" />
              </button>
            </div>

            {selectedBatch && (
              <>
                {batchInfo.archived ? (
                  <button
                    className="btn btn-sm btn-outline btn-success font-normal"
                    disabled
                  >
                    <BiArchiveIn size="1.25em" /> Archived
                  </button>
                ) : (
                  <button
                    className="btn btn-sm btn-outline btn-success font-normal"
                    onClick={() => setArchivingBatch(true)}
                  >
                    <BiArchiveIn size="1.25em" /> Archive this batch
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>

      <h1 className="text-lg font-bold">Applicants</h1>

      {selectedBatch ? (
        <>
          <div className="flex items-center justify-between mt-4 mb-8">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setAddingApplicant(true)}
              disabled={batchInfo && batchInfo.archived}
            >
              <BiPlus size="1.25em" /> Add new
            </button>

            {/* Search Bar */}
            <div className="flex items-center relative w-72">
              <input
                type="text"
                name="search"
                id="search"
                placeholder="Search"
                className="input input-bordered absolute w-full h-12"
                onChange={(e) => setSearchFilter(e.target.value)}
              />
              <BiSearch
                size="1.25em"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300"
              />
            </div>
          </div>

          <AllApplicantsTable
            isArchived={batchInfo && batchInfo.archived}
            searchFilter={searchFilter}
            state={[addingApplicant, setAddingApplicant]}
          />
        </>
      ) : (
        <div className="rounded-lg border-2 border-gray-200 px-4 py-16 mt-4 h-80 flex items-center justify-center">
          <p className="text-xs text-gray-400">
            Select a batch to start managing applicants.
          </p>
        </div>
      )}

      <CreateNewBatchModal open={batchModalOpen} setOpen={setBatchModalOpen} />
      <ConfirmationDialog
        title="Archive Batch"
        message={`Are you sure you want to archive batch "${batchInfo?.name}"?`}
        open={archivingBatch}
        setOpen={setArchivingBatch}
        onConfirm={archiveBatch}
        onCancel={() => setArchivingBatch(false)}
      />
    </>
  );
}
