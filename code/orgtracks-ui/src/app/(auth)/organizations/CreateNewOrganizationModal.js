"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Organization from "@/utils/api/organization";

import { BiBuilding } from "react-icons/bi";
import { Modal, ModalTitle, ModalBody, ModalAction } from "@/components/Modal";

export default function CreateNewOrganizationModal({ open, setOpen }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState(null);

  const createOrganization = async () => {
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("shortName", shortName);
    formData.append("description", description);
    formData.append("logo", logo);

    const org = await Organization.create(formData);

    if (!org || !org._id) {
      setLoading(false);
      setError(org.message || "There was an error creating your organization.");

      return;
    }

    router.push(`/organizations/${org._id}/manage/departments?new=true`);
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <ModalTitle>Create a New Organization</ModalTitle>
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
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="avatar">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setLogo(e.target.files[0]);
                    }
                  }}
                />
                <div
                  onClick={() =>
                    document.querySelector("input[type=file]").click()
                  }
                  className={`mask mask-squircle w-24 h-24`}
                >
                  {logo ? (
                    <img
                      src={URL.createObjectURL(logo)}
                      alt={name}
                      className="shadow-md"
                    />
                  ) : (
                    <span className="cursor-pointer hover:bg-violet-300 bg-violet-200 w-24 h-24 flex items-center justify-center">
                      <BiBuilding className="text-violet-800" size="1.5em" />
                    </span>
                  )}
                </div>
              </div>
              {!logo && (
                <span className="text-xs text-gray-500">Upload a logo</span>
              )}
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text text-gray-600 text-xs">
                  Organization Name
                </span>
              </label>
              <input
                type="text"
                placeholder="Organization Name"
                className="input input-bordered"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            </div>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text text-gray-600 text-xs">
                  Short Name
                </span>
              </label>
              <input
                type="text"
                placeholder="Short Name"
                className="input input-bordered"
                onChange={(e) => setShortName(e.target.value)}
                value={shortName}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-600 text-xs">
                  Description
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            {/* show an alert if there is an error */}
            {error && (
              <div className="alert alert-error shadow-sm mt-4">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current flex-shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-xs">{error}</span>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalAction>
            <button className="btn" onClick={() => setOpen(false)}>
              Close
            </button>
            <button
              className="btn btn-primary"
              onClick={createOrganization}
              disabled={!(name && shortName && description)}
            >
              Create
            </button>
          </ModalAction>
        </>
      )}
    </Modal>
  );
}
