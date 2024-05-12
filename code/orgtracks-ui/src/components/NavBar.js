"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import Notification from "@/utils/api/notification";

import { AuthContext } from "@/context/AuthContext";
import { UserContext } from "@/context/UserContext";
import { SocketContext } from "@/context/SocketContext";
import { SystemFeedbackContext } from "@/context/SystemFeedbackContext";

import Image from "next/image";
import Link from "next/link";

import { BiUser, BiBell } from "react-icons/bi";
import InvitationRequestNotification from "./notifications/InvitationRequestNotification";
import InvitationResponseNotification from "./notifications/InvitationResponseNotification";
import AppointmentNotification from "./notifications/AppointmentNotification";
import InterviewerFeedbackNotification from "./notifications/InterviewerFeedbackNotification";

dayjs.extend(relativeTime);

const NotificationSkeleton = () => {
  return (
    <div className={`flex items-start gap-4 px-4 py-3`}>
      <div className="relative">
        {/* avatar */}
        <div className="mask mask-squircle w-12 h-12 skeleton"></div>
      </div>
      <div className={`text-sm`}>
        {/* content */}
        <div className="skeleton w-64 h-4"></div>
        <div className="skeleton w-32 h-4 mt-2"></div>
      </div>
      <div className="ml-auto">
        {/* date */}
        <div className="skeleton w-6 h-4"></div>
      </div>
    </div>
  );
};

const NotificationPanel = ({ notifications }) => {
  const router = useRouter();
  const { data, loading } = notifications;
  const { notifs } = data || {};

  const { showMessage } = useContext(SystemFeedbackContext);

  const onRespond = (error, data) => {
    if (error) {
      showMessage({
        type: "error",
        message: data.message,
      });
      return;
    }

    document.body.click();
    notifications.refetch();

    if (data.redirect) {
      router.push(data.redirect);
    }
  };

  const onRead = async (notif) => {
    document.body.click();

    await Notification.markAsRead(notif._id);
    notifications.refetch();

    router.push(notif.context.redirect);
  };

  return (
    <div
      tabIndex={0}
      className="mt-1 z-[1] card card-compact dropdown-content w-[450px] bg-base-100 shadow border-2 max-h-[80vh] overflow-y-auto"
    >
      <div className="card-body !p-0">
        <span className="font-bold text-lg p-4">Notifications</span>

        {/* Membership Invitation Notification */}
        {/* <NotificationSkeleton /> */}
        {loading ? (
          <NotificationSkeleton />
        ) : notifs && notifs.length > 0 ? (
          notifs.map((notif) => {
            if (notif.type.startsWith("invite:")) {
              return (
                <InvitationRequestNotification
                  key={notif._id}
                  notif={notif}
                  onRespond={onRespond}
                />
              );
            } else if (notif.type.startsWith("invite-response:")) {
              return (
                <InvitationResponseNotification
                  key={notif._id}
                  notif={notif}
                  onRead={onRead}
                />
              );
            } else if (notif.type === "appointment") {
              return (
                <AppointmentNotification
                  key={notif._id}
                  notif={notif}
                  onRead={onRead}
                />
              );
            } else if (notif.type === "interviewer-feedback") {
              return (
                <InterviewerFeedbackNotification
                  key={notif._id}
                  notif={notif}
                  onRead={onRead}
                />
              );
            }
          })
        ) : (
          <div className="p-4 flex items-center justify-center flex-col gap-2 text-gray-400">
            <BiBell size="1.5em" />
            <p className="text-xs">No notifications.</p>
          </div>
        )}
        <div className="card-actions">
          {/* <button className="btn btn-primary btn-block">View</button> */}
        </div>
      </div>
    </div>
  );
};

export default function NavBar() {
  const { user, loading, logOut } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const router = useRouter();

  const { notifications } = useContext(UserContext);

  const [lastLoggedUser, setLastLoggedUser] = useState(null);

  useEffect(() => {
    if (user) {
      setLastLoggedUser(user);
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on("notification", (notif) => {
        notifications.refetch();
      });
    }

    return () => {
      if (socket) {
        socket.off("notification");
      }
    };
  }, [socket]);

  const onLogOut = () => {
    logOut();
    router.push("/login");
  };

  return (
    <div className="navbar bg-base-100 shadow-md">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <Link href="/applications">My Applications</Link>
            </li>
            <li>
              <Link href="/organizations">My Organizations</Link>
            </li>
          </ul>
        </div>
        <Link
          href="/home"
          className="btn btn-ghost normal-case text-xl text-primary"
        >
          OrgTracks
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href="/applications">My Applications</Link>
          </li>
          <li>
            <Link href="/organizations">My Organizations</Link>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <div className="indicator">
              <BiBell size="1.25em" />
              {notifications.data?.unreadCount > 0 && (
                <span className="badge badge-sm indicator-item bg-primary text-white">
                  {notifications.data?.unreadCount}
                </span>
              )}{" "}
            </div>
          </label>
          <NotificationPanel notifications={notifications} />
        </div>
        <div className="dropdown dropdown-end">
          <label
            tabIndex={0}
            className="btn btn-ghost btn-circle avatar overflow-hidden p-1.5"
          >
            {/* Loading Avatar */}
            {loading && !lastLoggedUser && (
              <div className="skeleton w-8 h-8 rounded-full shrink-0"></div>
            )}
            {/* User Avatar */}
            {lastLoggedUser ? (
              <Image
                className="rounded-full"
                src={lastLoggedUser.avatar}
                alt={`${lastLoggedUser.first_name} ${lastLoggedUser.last_name}`}
                width={32}
                height={32}
              />
            ) : (
              <BiUser size="1.25em" />
            )}
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-1 z-[1] p-2 shadow bg-base-100 rounded-box w-52 border-2"
          >
            <li>
              <a onClick={onLogOut} className="flex justify-between">
                Logout
                {loading && (
                  <span className="loading loading-spinner loading-xs"></span>
                )}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
