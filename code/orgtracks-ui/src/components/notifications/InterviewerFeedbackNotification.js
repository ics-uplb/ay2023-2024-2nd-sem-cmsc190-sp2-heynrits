"use client";
import { toBase64Src } from "@/utils/generic";
import dayjs from "dayjs";

import { BiUser, BiBuilding } from "react-icons/bi";

const InterviewerFeedbackNotification = ({ notif, onRead }) => {
  const { read, context } = notif;
  const senderName = context.sender.firstName + " " + context.sender.lastName;

  return (
    <div
      className={`flex items-start gap-4 hover:bg-gray-50 ${
        read && "bg-gray-100"
      } px-4 py-3 cursor-pointer`}
      onClick={() => onRead(notif)}
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

export default InterviewerFeedbackNotification;
