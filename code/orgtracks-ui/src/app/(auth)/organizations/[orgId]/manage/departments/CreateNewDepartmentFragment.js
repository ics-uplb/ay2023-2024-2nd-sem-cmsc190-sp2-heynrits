"use client";

import { BiSave, BiX } from "react-icons/bi";

import Organization from "@/utils/api/organization";
import { useState } from "react";
import { useParams } from "next/navigation";

export default function CreateNewDepartmentFragment({
  setAddingDept,
  onCreate,
}) {
  const params = useParams();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const createDepartment = async () => {
    setLoading(true);

    const data = await Organization.createDepartment(params["orgId"], name);

    setLoading(false);
    setAddingDept(false);

    if (!data || data.message) {
      onCreate(true, data || { message: "There was a problem creating the department." });
      return;
    }

    onCreate(false, data);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="block md:hidden fixed bg-black opacity-50 top-0 left-0 right-0 bottom-0 z-[9]"
        onClick={() => setAddingDept(false)}
      ></div>

      {/* Row/Modal */}
      <tr className="fixed md:relative top-1/2 -translate-y-1/2 md:translate-y-0 left-1/2 -translate-x-1/2 z-10 bg-white w-full max-w-md md:border-2 md:border-indigo-300 flex md:table-row flex-col shadow-xl md:shadow-none p-4 md:p-0 rounded-xl">
        <td className="block md:hidden">
          <div className="text-lg font-bold">Create a new department</div>
        </td>
        <td>
          <input
            autoFocus
            type="text"
            name="department"
            id="department"
            placeholder="Department Name"
            className="input input-bordered md:input-sm w-full md:w-72"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </td>
        <td></td>
        <td>
          <div className="flex flex-row-reverse md:flex-row items-center justify-start gap-3">
            <button
              className="btn btn-primary btn-sm md:btn-xs"
              onClick={createDepartment}
            >
              <BiSave size="1.25em" /> Save
            </button>
            <button
              className="btn btn-ghost btn-sm md:btn-xs"
              onClick={() => setAddingDept(false)}
            >
              <BiX size="1.25em" /> Cancel
            </button>
          </div>
        </td>
      </tr>
    </>
  );
}
