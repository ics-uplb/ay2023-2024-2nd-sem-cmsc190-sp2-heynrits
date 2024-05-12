"use client";
import { useContext, useEffect, useState } from "react";

import Link from "next/link";

import { AuthContext } from "@/context/AuthContext";

const WelcomeModal = ({ name, open, setOpen }) => {
  return (
    <>
      <dialog id="my_modal_1" className={`modal ${open && "modal-open"}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg text-primary">Hello, {name}!</h3>
          <img
            src="/welcome.svg"
            className="mx-auto my-8 w-full max-w-[200px]"
          />
          <p className="py-4 text-sm">
            Welcome to{" "}
            <strong>
              OrgTracks: A Real-Time Interview Activities Tracker for UPLB
              Student Organizations
            </strong>
            !
          </p>
          <div className="modal-action">
            <form method="dialog">
              <button
                className="btn btn-primary"
                onClick={() => setOpen(false)}
              >
                Start
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default function Home() {
  const [welcome, setWelcome] = useState(false);
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    setWelcome(
      new URLSearchParams(window.location.search).get("welcome") === "true"
    );
  }, []);

  return (
    <main className="container mx-auto p-8">
      <img src="/interview.svg" className="mx-auto my-16 w-full max-w-xs" />
      <div className="shadow-lg p-8 rounded-md border-[1px] border-gray-100">
        <h1 className="text-lg font-bold mb-4 text-primary">About OrgTracks</h1>
        <p className="text-sm">
          OrgTracks is a web application that aims to streamline the process of
          tracking interview activities in the recruitment process of student
          organizations in UPLB. It is composed of several modules intended for
          organization members and applicants, allowing them to accomplish their
          respective roles in keeping track of interview process-related
          information.
        </p>

        <p className="text-sm mt-4">
          To start, click{" "}
          <Link
            className="text-primary font-semibold hover:underline"
            href="/applications"
          >
            "My Applications"
          </Link>{" "}
          or{" "}
          <Link
            className="text-primary font-semibold hover:underline"
            href="/organizations"
          >
            "My Organizations"
          </Link>
          , depending on your role in an organization.
        </p>
      </div>

      {!loading && user && (
        <WelcomeModal
          name={user.firstName}
          open={welcome}
          setOpen={setWelcome}
        />
      )}
    </main>
  );
}
