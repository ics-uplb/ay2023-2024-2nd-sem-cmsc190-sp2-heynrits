"use client";
import { useState } from "react";
import { BiPlus, BiSearch } from "react-icons/bi";
import AllMembersTable from "./AllMembersTable";

export default function MembersSettings() {
  const [addingMember, setAddingMember] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  return (
    <>
      <h1 className="text-lg font-bold">Members</h1>

      <div className="flex items-center justify-between mt-4 mb-8">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setAddingMember(true)}
        >
          <BiPlus size="1.25em" /> Invite Member
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
            value={searchFilter}
          />
          <BiSearch
            size="1.25em"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300"
          />
        </div>
      </div>

      <AllMembersTable state={[addingMember, setAddingMember]} searchFilter={searchFilter} />
    </>
  );
}
