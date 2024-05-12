import { useState, useEffect } from "react";

import User from "@/utils/api/user";

export const useUser = () => {
  const [notifications, setNotifications] = useState({});
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    const org = await User.getNotifications();
    setNotifications(org);
    setNotificationsLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications: {
      data: notifications,
      loading: notificationsLoading,
      refetch: fetchNotifications,
    },
  };
};
