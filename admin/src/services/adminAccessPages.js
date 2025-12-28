import axios from "axios";

export const getAdminAccessPages = async () => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/v1/admin/access-pages`,
      {
        headers: {
          Authorization: `${localStorage.getItem("accessToken")}`, // Add token if required
        },
      }
    );

    return res.data.data; // returns the accessPages array
  } catch (error) {
    console.error("❌ Failed to fetch admin access pages:", error);
    throw error;
  }
};
