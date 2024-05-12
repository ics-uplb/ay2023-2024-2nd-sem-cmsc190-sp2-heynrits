"use client";
import { useState } from "react";

import { BiSearch, BiPlus } from "react-icons/bi";
import AllOrganizationsTable from "./AllOrganizationsTable";
import CreateNewOrganizationModal from "./CreateNewOrganizationModal";

export default function MyApplications() {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  return (
    <main className="px-8 py-6">
      <h2 className="font-bold text-sm mb-8">My Organizations</h2>

      <div className="flex justify-between ">
        <button
          className="btn btn-primary btn-sm mt-2 mb-4"
          onClick={() => setModalOpen(true)}
        >
          <BiPlus size="1.25em" /> New Organization
        </button>
        <div className="relative w-72">
          <input
            type="text"
            name="search"
            id="search"
            placeholder="Search my organizations"
            className="input input-bordered absolute w-full h-12 text-sm"
            onChange={(e) => setSearchFilter(e.target.value)}
            value={searchFilter}
          />
          <BiSearch
            size="1.25em"
            className="absolute right-4 top-1/2 -translate-y-2/3 text-gray-300"
          />
        </div>
      </div>

      <AllOrganizationsTable searchFilter={searchFilter} />
      <CreateNewOrganizationModal open={modalOpen} setOpen={setModalOpen} />
    </main>
  );
}
