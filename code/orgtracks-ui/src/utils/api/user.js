import axios from "@/utils/axios";

export const getNotifications = async () => {
  try {
    const { data } = await axios.get("/notifications", {
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    return null;
  }
};

export const respondToMembershipInvitation = async (orgId, roleId, action) => {
  try {
    const { data } = await axios({
      method: "put",
      url: `/organization/${orgId}/membership-invitation/${roleId}/respond?action=${action}`,
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    return null;
  }
};

export const respondToApplicantInvitation = async (orgId, roleId, action) => {
  try {
    const { data } = await axios({
      method: "put",
      url: `/organization/${orgId}/application-invitation/${roleId}/respond?action=${action}`,
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    return null;
  }
};

export default {
  getNotifications,
  respondToMembershipInvitation,
  respondToApplicantInvitation,
};
