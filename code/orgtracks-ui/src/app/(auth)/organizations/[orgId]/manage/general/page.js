"use client";
import { useContext, useEffect, useState } from "react";

import Organization from "@/utils/api/organization";
import { OrganizationContext } from "@/context/OrganizationContext";

import { BiBuilding, BiPlus, BiSearch } from "react-icons/bi";
import { toBase64Src } from "@/utils/generic";
import { SystemFeedbackContext } from "@/context/SystemFeedbackContext";

export default function GeneralSettings() {
  const { organization } = useContext(OrganizationContext);
  const { showMessage } = useContext(SystemFeedbackContext);

  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (organization.data) {
      setName(organization.data.name || "");
      setShortName(organization.data.shortName || "");
      setDescription(organization.data.description || "");
      setLogo(organization.data.logo || null);
    }
  }, [organization.data]);

  const updateOrganization = async () => {
    setLoading(true);

    const updated = {
      name,
      shortName,
      description,
    };

    const org = await Organization.update(organization.data._id, updated);

    if (!org || !org._id) {
      setError(org.message || "There was an error updating your organization.");
    } else {
      showMessage({
        type: "success",
        message: "Your organization has been updated.",
      });
    }

    setLoading(false);

    organization.refetch();
  };

  const removeLogo = async () => {
    if (logo) {
      setLogoLoading(true);
      const res = await Organization.removeLogo(organization.data._id);

      if (!res || res.message) {
        showMessage({
          type: "error",
          message: res?.message || "There was an error removing the logo.",
        });
        return;
      }

      showMessage({
        type: "success",
        message: "Your organization's logo has been removed.",
      });

      setLogo(null);
      setLogoLoading(false);

      organization.refetch();
    }
  };

  const updateLogo = async (e) => {
    if (e.target.files[0]) {
      setLogoLoading(true);
      const data = new FormData();
      data.append("logo", e.target.files[0]);
      const res = await Organization.updateLogo(organization.data._id, data);

      if (!res || res.message) {
        showMessage({
          type: "error",
          message: res?.message || "There was an error updating the logo.",
        });
        return;
      }

      showMessage({
        type: "success",
        message: "Your organization's logo has been updated.",
      });

      setLogo(res.logo);
      setLogoLoading(false);

      organization.refetch();
    }
  };

  return (
    <>
      <h1 className="text-lg font-bold">Organization Profile</h1>

      <div className="mt-8">
        <div className="flex gap-6 items-center">
          <div className="avatar">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={updateLogo}
            />
            <div
              className={`mask mask-squircle w-32 h-32 ${
                organization.loading && "skeleton"
              }`}
            >
              {!organization.loading && (
                <>
                  {logoLoading ? (
                    <span className="bg-violet-200 w-32 h-32 flex items-center justify-center">
                      <span className="loading loading-spinner loading-md"></span>
                    </span>
                  ) : (
                    <>
                      {logo ? (
                        <img
                          src={toBase64Src(logo.data)}
                          alt={name}
                          className="shadow-md"
                        />
                      ) : (
                        <span className="bg-violet-200 w-32 h-32 flex items-center justify-center">
                          <BiBuilding
                            className="text-violet-800"
                            size="1.5em"
                          />
                        </span>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {organization.loading ? (
              <>
                <div className="skeleton w-28 h-6"></div>
                <div className="skeleton w-28 h-6"></div>
              </>
            ) : (
              <>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() =>
                    document.querySelector("input[type=file]").click()
                  }
                >
                  {logo ? "Change" : "Upload a"} Logo
                </button>
                <button
                  className="btn btn-primary btn-outline btn-sm"
                  disabled={!logo}
                  onClick={removeLogo}
                >
                  Remove Logo
                </button>
              </>
            )}
          </div>
        </div>

        <div className="form-control mt-8 mb-4">
          <label className="label">
            <span className="label-text text-gray-600 text-xs">
              Organization Name
            </span>
          </label>
          {organization.loading ? (
            <div className="skeleton w-96 h-12"></div>
          ) : (
            <input
              type="text"
              placeholder="Organization Name"
              className="input input-bordered max-w-lg"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          )}
        </div>
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text text-gray-600 text-xs">Short Name</span>
          </label>
          {organization.loading ? (
            <div className="skeleton w-96 h-12"></div>
          ) : (
            <input
              type="text"
              placeholder="Short Name"
              className="input input-bordered max-w-lg"
              onChange={(e) => setShortName(e.target.value)}
              value={shortName}
            />
          )}
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text text-gray-600 text-xs">
              Description
            </span>
          </label>
          {organization.loading ? (
            <div className="skeleton w-96 h-40"></div>
          ) : (
            <textarea
              className="textarea textarea-bordered h-36 max-w-lg"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          )}
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

        <div className="mt-8">
          {organization.loading ? (
            <div className="skeleton w-16 h-8"></div>
          ) : (
            <button
              className="btn btn-primary"
              onClick={updateOrganization}
              disabled={loading || !(name && shortName && description)}
            >
              {loading && <span className="loading loading-spinner"></span>}{" "}
              {loading ? "Saving..." : "Save"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
