// import axios from "axios";

// const registerUser = async ({ fullName, email, phoneNumber, password, ref_by }) => {
//   try {
//     const res = await axios.post(
//       `${import.meta.env.VITE_API_URL}/auth/register`,
//       { 
//         fullName,
//         email,
//         phoneNumber,
//         password,
//         ref_by
//       }
//     );
//     return res.data;
//   } catch (error) {
//     console.error("Failed to register user:", error.response?.data || error.message);
//     throw error;
//   }
// };

// const verifyOTP = async ({ identifier, code }) => {
//   try {
//     const res = await axios.post(
//       `${import.meta.env.VITE_API_URL}/auth/verify-otp`,  // ✅ fixed: added /api if needed
//       { identifier, code }
//     );
//     return res.data;
//   } catch (error) {
//     console.error("OTP error:", error.response?.data || error.message);
//     throw error;
//   }
// };

// export { registerUser, verifyOTP };


import axios from "axios";

const registerUser = async ({ fullName, email, phoneNumber, password, ref_by }) => {
  try {
    // ✅ API URL already has /api in it
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/register`,
      {
        fullName,
        email,
        phoneNumber,
        password,
        ref_by,
      }
    );
    return res.data;
  } catch (error) {
    console.error("Failed to register user:", error.response?.data || error.message);
    throw error;
  }
};

const verifyOTP = async ({ identifier, code }) => {
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/verify-otp`,
      { identifier, code }
    );
    return res.data;
  } catch (error) {
    console.error("OTP error:", error.response?.data || error.message);
    throw error;
  }
};

export { registerUser, verifyOTP };
