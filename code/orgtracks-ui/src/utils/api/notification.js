import axios from "@/utils/axios";

const markAsRead = async (notificationId) => {
  try {
    const { data } = await axios({
      url: `/notifications/${notificationId}/read`,
      method: "put",
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
    markAsRead,
}