import axios from "axios";
import { API_CONFIG } from "../config/api.config";

export const getAdminAccessPages = async () => {
  try {
    const res = await axios.get(
      `${API_CONFIG.API_BASE}/v1/admin/access-pages`,
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
