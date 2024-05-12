"use client";
import dayjs from "dayjs";

import User from "@/utils/api/user";

import { BiUser, BiBuilding } from "react-icons/bi";
import { toBase64Src } from "@/utils/generic";

const InvitationRequestNotification = ({ notif, onRespond }) => {
  const { read, context } = notif;
  const senderName = context.sender.firstName + " " + context.sender.lastName;

  const respondToInvitation = async (action) => {
    const invitationType = notif.type.split(":")[1];

    let data = null;

    switch (invitationType) {
      case "membership":
        data = await User.respondToMembershipInvitation(
          context.organization._id,
          context.role._id,
          action
        );
        break;
      case "application":
        data = await User.respondToApplicantInvitation(
          context.organization._id,
          context.role._id,
          action
        );
        break;
    }

    if (!data || data.message) {
      onRespond(
        true,
        data || {
          message: "There was a problem responding to the invitation.",
        }
      );
    } else {
      onRespond(false, data);
    }
  };

  return (
    <div
      className={`flex items-start gap-4 hover:bg-gray-50 ${
        read && "bg-gray-100"
      } px-4 py-3`}
    >
      <div className="relative">
        {/* avatar */}
        <div className="mask mask-squircle w-12 h-12 bg-base-200">
          {context.sender.avatar ? (
            <img
              className="object-cover w-12 h-12"
              src={context.sender.avatar}
              alt={`${context.sender.firstName} ${context.sender.lastName}`}
            />
          ) : (
            <span className="w-12 h-12 flex items-center justify-center">
              <BiUser size="1.25em" />
            </span>
          )}
        </div>
        <div className="mask mask-squircle w-6 h-6 bg-base-300 absolute -right-1 -bottom-1">
          {context.organization.logo ? (
            <img
              className="object-cover w-6 h-6"
              src={toBase64Src(context.organization.logo.data)}
              alt={context.organization.name}
            />
          ) : (
            <div className="w-6 h-6 flex items-center justify-center">
              <BiBuilding size="1em" />
            </div>
          )}
        </div>
      </div>
      <div className={`${read ? "text-gray-500" : "text-gray-700"}`}>
        {/* content */}
        <div className="text-sm font-semibold">
          [{context.organization.name}] {senderName}
        </div>
        <div className="text-xs">{notif.message}</div>
        {/* Action */}
        {notif.type.startsWith("invite:") && (
          <div className="mt-2 flex gap-2">
            <button
              className="btn btn-xs btn-primary"
              onClick={() => respondToInvitation("accept")}
            >
              Accept
            </button>
            <button
              className="btn btn-xs btn-ghost"
              onClick={() => respondToInvitation("decline")}
            >
              Decline
            </button>
          </div>
        )}
      </div>
      <div className="ml-auto">
        {/* date */}
        <span className={`text-xs ${read ? "text-gray-400" : "text-gray-500"}`}>
          {dayjs().to(dayjs(notif.createdAt))}
        </span>
      </div>
    </div>
  );
};

export default InvitationRequestNotification;
