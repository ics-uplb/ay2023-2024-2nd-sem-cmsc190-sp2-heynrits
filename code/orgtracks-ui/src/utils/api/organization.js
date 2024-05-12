import axios from "@/utils/axios";

export const getAll = async () => {
  try {
    const { data } = await axios.get("/organization", {
      headers: {
        withAuth: true,
      },
    });
    return data.organizations;
  } catch (err) {
    return null;
  }
};

export const getOne = async (id) => {
  try {
    const { data } = await axios.get(`/organization/${id}`, {
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    return null;
  }
};

export const getOneByBatchId = async (id) => {
  try {
    const { data } = await axios.get(`/organization/batches/${id}`, {
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    return null;
  }
};

export const create = async (payload) => {
  console.log(payload);
  try {
    const { data } = await axios({
      method: "post",
      url: "/organization/create",
      data: payload,
      headers: {
        withAuth: true,
        "Content-Type": "multipart/form-data",
      },
    });

    return data.organization;
  } catch (err) {
    console.log(err);
    if (err.response.status >= 400 && err.response.status < 500) {
      return err.response.data;
    }

    return null;
  }
};

export const update = async (id, payload) => {
  try {
    const { data } = await axios.put(`/organization/${id}`, payload, {
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    console.log(err);
    if (err.response.status >= 400 && err.response.status < 500) {
      return err.response.data;
    }

    return null;
  }
};

export const updateLogo = async (id, payload) => {
  try {
    const { data } = await axios.put(`/organization/${id}/logo`, payload, {
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    console.log(err);
    if (err.response.status >= 400 && err.response.status < 500) {
      return err.response.data;
    }

    return null;
  }
};

export const removeLogo = async (id) => {
  try {
    const { data } = await axios.delete(`/organization/${id}/logo`, {
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    console.log(err);
    if (err.response.status >= 400 && err.response.status < 500) {
      return err.response.data;
    }

    return null;
  }
};

export const remove = async (id) => {
  try {
    const { data } = await axios.delete(
      `/organization/${id}`,
      {},
      {
        headers: {
          withAuth: true,
        },
      }
    );
    return data;
  } catch (err) {
    console.log(err);
    if (err.response.status >= 400 && err.response.status < 500) {
      return err.response.data;
    }

    return null;
  }
};

// role
export const getMemberRole = async (orgId) => {
  try {
    const { data } = await axios.get(`/organization/${orgId}/role`, {
      headers: {
        withAuth: true,
      },
    });
    return data.roles;
  } catch (err) {
    return null;
  }
};

// department
export const getDepartments = async (orgId) => {
  try {
    const { data } = await axios.get(`/organization/${orgId}/department`, {
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    console.log(err);
    if (err.response.status >= 400 && err.response.status < 500) {
      return err.response.data;
    }

    return null;
  }
};

export const getDepartment = async (orgId, id) => {
  try {
    const { data } = await axios.get(
      `/organization/${orgId}/department/${id}`,
      {
        headers: {
          withAuth: true,
        },
      }
    );
    return data;
  } catch (err) {
    console.log(err);
    if (err.response.status >= 400 && err.response.status < 500) {
      return err.response.data;
    }

    return null;
  }
};

export const createDepartment = async (orgId, name) => {
  try {
    const { data } = await axios({
      method: "post",
      url: `/organization/${orgId}/department/create`,
      data: {
        name,
      },
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    console.log(err);
    if (err.response.status >= 400 && err.response.status < 500) {
      return err.response.data;
    }

    return null;
  }
};

export const updateDepartment = async (orgId, id, name) => {
  try {
    const { data } = await axios({
      method: "put",
      url: `/organization/${orgId}/department/${id}`,
      data: {
        name,
      },
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    console.log(err);
    if (err.response.status >= 400 && err.response.status < 500) {
      return err.response.data;
    }

    return null;
  }
};

export const removeDepartment = async (orgId, id) => {
  try {
    const { data } = await axios({
      method: "delete",
      url: `/organization/${orgId}/department/${id}`,
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    console.log(err);
    if (err.response.status >= 400 && err.response.status < 500) {
      return err.response.data;
    }

    return null;
  }
};

// member

export const getMembers = async (id) => {
  try {
    const { data } = await axios.get(`/organization/${id}/member`, {
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    console.log(err);
    if (err.response.status >= 400 && err.response.status < 500) {
      return err.response.data;
    }

    return null;
  }
};

export const updateMember = async (orgId, id, payload) => {
  try {
    const { data } = await axios({
      method: "put",
      url: `/organization/${orgId}/member/${id}`,
      data: payload,
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    console.log(err);
    if (err.response.status >= 400 && err.response.status < 500) {
      return err.response.data;
    }

    return null;
  }
};

export const inviteMember = async (orgId, payload) => {
  try {
    const { data } = await axios({
      method: "post",
      url: `/organization/${orgId}/member/invite`,
      data: payload,
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    console.log(err);
    if (err.response.status >= 400 && err.response.status < 500) {
      return err.response.data;
    }
    return null;
  }
};

export const removeMember = async (orgId, id) => {
  try {
    const { data } = await axios({
      method: "delete",
      url: `/organization/${orgId}/member/${id}`,
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    console.log(err);
    if (err.response.status >= 400 && err.response.status < 500) {
      return err.response.data;
    }

    return null;
  }
};

// batches

export const getBatches = async (id) => {
  try {
    const { data } = await axios.get(`/organization/${id}/batches`, {
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    console.log(err);
    if (err.response.status >= 400 && err.response.status < 500) {
      return err.response.data;
    }

    return null;
  }
};

export const getBatch = async (orgId, batchId) => {
  try {
    const { data } = await axios.get(
      `/organization/${orgId}/batches/${batchId}`,
      {
        headers: {
          withAuth: true,
        },
      }
    );
    return data;
  } catch (err) {
    console.log(err);
    if (err.response.status >= 400 && err.response.status < 500) {
      return err.response.data;
    }

    return null;
  }
};

export const createBatch = async (orgId, name) => {
  try {
    const { data } = await axios({
      method: "post",
      url: `/organization/${orgId}/batches/create`,
      data: { name },
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    console.log(err);
    if (err.response.status >= 400 && err.response.status < 500) {
      return err.response.data;
    }
    return null;
  }
};

export const archiveBatch = async (orgId, batchId) => {
  try {
    const { data } = await axios({
      method: "put",
      url: `/organization/${orgId}/batches/${batchId}/archive`,
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    console.log(err);
    if (err.response.status >= 400 && err.response.status < 500) {
      return err.response.data;
    }
    return null;
  }
};

// applicants

export const getOrgApplicants = async (orgId, batchId) => {
  try {
    const { data } = await axios.get(
      `/organization/${orgId}/batches/${batchId}/applicants`,
      {
        headers: {
          withAuth: true,
        },
      }
    );
    return data;
  } catch (err) {
    console.log(err);
    if (err.response.status >= 400 && err.response.status < 500) {
      return err.response.data;
    }

    return null;
  }
};

export const inviteOrgApplicant = async (orgId, batchId, payload) => {
  try {
    const { data } = await axios({
      method: "post",
      url: `/organization/${orgId}/batches/${batchId}/applicants/invite`,
      data: payload,
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    console.log(err);
    if (err.response.status >= 400 && err.response.status < 500) {
      return err.response.data;
    }
    return null;
  }
};

export const removeOrgApplicant = async (orgId, batchId, applicantId) => {
  try {
    const { data } = await axios({
      method: "delete",
      url: `/organization/${orgId}/batches/${batchId}/applicants/${applicantId}`,
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    console.log(err);
    if (err.response.status >= 400 && err.response.status < 500) {
      return err.response.data;
    }
    return null;
  }
};

// interview assignment
export const getInterviewAssignmentsOfApplicant = async (
  orgId,
  batchId,
  applicantId
) => {
  try {
    const { data } = await axios.get(
      `/organization/${orgId}/batches/${batchId}/applicants/${applicantId}/interview-assignments`,
      {
        headers: {
          withAuth: true,
        },
      }
    );
    return data;
  } catch (err) {
    console.log(err);
    if (err.response.status >= 400 && err.response.status < 500) {
      return err.response.data;
    }
    return null;
  }
};

export const getInterviewAssignmentsOfMember = async (
  orgId,
  batchId,
  memberId
) => {
  try {
    const { data } = await axios.get(
      `/organization/${orgId}/batches/${batchId}/members/${memberId}/interview-assignments`,
      {
        headers: {
          withAuth: true,
        },
      }
    );
    return data;
  } catch (err) {
    console.log(err);
    if (err.response.status >= 400 && err.response.status < 500) {
      return err.response.data;
    }
    return null;
  }
};

export const getAllInterviewAssignments = async (orgId, batchId) => {
  try {
    const { data } = await axios.get(
      `/organization/${orgId}/batches/${batchId}/applicants/progress`,
      {
        headers: {
          withAuth: true,
        },
      }
    );
    return data;
  } catch (err) {
    console.log(err);
    if (err.response.status >= 400 && err.response.status < 500) {
      return err.response.data;
    }
    return null;
  }
};

export const assignInterviews = async (
  orgId,
  batchId,
  applicantId,
  payload
) => {
  try {
    const { data } = await axios({
      method: "post",
      url: `/organization/${orgId}/batches/${batchId}/applicants/${applicantId}/interview-assignments`,
      data: payload,
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    console.log(err);
    if (err.response.status >= 400 && err.response.status < 500) {
      return err.response.data;
    }
    return null;
  }
};

const getMyCalendarAsMember = async (orgId, batchId) => {
  try {
    const { data } = await axios({
      url: `/organization/${orgId}/batches/${batchId}/interview-appointments/calendar`,
      method: "get",
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    return null;
  }
};

const blockTimeSlot = async (orgId, batchId, timeSlot) => {
  try {
    const { data } = await axios({
      url: `/organization/${orgId}/batches/${batchId}/interview-appointments/calendar/block`,
      method: "post",
      headers: {
        withAuth: true,
      },
      data: timeSlot,
    });
    return data;
  } catch (err) {
    return null;
  }
};

const unblockTimeSlot = async (orgId, batchId, interviewAssignmentId) => {
  try {
    const { data } = await axios({
      url: `/organization/${orgId}/batches/${batchId}/interview-appointments/calendar/unblock`,
      method: "post",
      headers: {
        withAuth: true,
      },
      data: {
        interviewAssignmentId,
      },
    });
    return data;
  } catch (err) {
    return null;
  }
};

// user preferences
const getPreferences = async (orgId) => {
  try {
    const { data } = await axios({
      url: `/preferences?organization=${orgId}`,
      method: "get",
      headers: {
        withAuth: true,
      },
    });
    return data;
  } catch (err) {
    return null;
  }
};

const updatePreferences = async (orgId, payload) => {
  try {
    const { data } = await axios({
      url: `/preferences`,
      method: "put",
      headers: {
        withAuth: true,
      },
      data: {
        ...payload,
        organization: orgId,
      },
    });
    return data;
  } catch (err) {
    return null;
  }
};

export default {
  //organization
  getAll,
  getOne,
  getOneByBatchId,
  create,
  update,
  updateLogo,
  removeLogo,
  remove,

  // role
  getMemberRole,

  // department
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  removeDepartment,

  // members
  getMembers,
  updateMember,
  inviteMember,
  removeMember,

  // batches
  getBatches,
  getBatch,
  createBatch,
  archiveBatch,

  // applicants
  getOrgApplicants,
  inviteOrgApplicant,
  removeOrgApplicant,

  // interview assignment
  getInterviewAssignmentsOfApplicant,
  getInterviewAssignmentsOfMember,
  getAllInterviewAssignments,
  assignInterviews,

  getMyCalendarAsMember,
  blockTimeSlot,
  unblockTimeSlot,

  // user preferences
  getPreferences,
  updatePreferences,
};
