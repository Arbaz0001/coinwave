import React, { useState } from "react";
import FormInput from "../components/FormInput";
import PhoneInput from "../components/PhoneInput";
import PasswordInput from "../components/PasswordInput";
import { countryCodes } from "../utils/countryCodes";
import { registerUser } from "../utils/registerUser";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

const Signup = () => {
  const [searchParams] = useSearchParams();
  const refId = searchParams.get("ref");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    ref_by: refId || "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  /* ======================
     HANDLERS
  ====================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  /* ======================
     VALIDATION
  ====================== */

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) error = "Name is required";
        else if (value.trim().length < 2)
          error = "Minimum 2 characters required";
        break;

      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Invalid email address";
        break;

      case "phone":
        if (!value.trim()) error = "Phone number is required";
        else {
          const country = countryCodes.find((c) =>
            value.startsWith(c.code)
          );
          if (!country) error = "Invalid country code";
          else if (!country.pattern.test(value))
            error = "Invalid phone number";
        }
        break;

      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 8)
          error = "Minimum 8 characters required";
        break;

      case "confirmPassword":
        if (!value) error = "Please confirm password";
        else if (value !== formData.password)
          error = "Passwords do not match";
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  const validateForm = () => {
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      if (!validateField(key, formData[key])) {
        isValid = false;
      }
    });

    return isValid;
  };

  /* ======================
     SUBMIT
  ====================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitStatus({
        type: "error",
        message: "Please fix the errors above",
      });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      fullName: formData.name.trim(),
      email: formData.email.trim(),
      phoneNumber: formData.phone.trim(),
      password: formData.password,
      ref_by: refId || null,
    };

    try {
      const res = await registerUser(payload);

      if (res.success) {
        setSubmitStatus({
          type: "success",
          message:
            "Account created successfully! Redirecting to login...",
        });

        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          ref_by: "",
        });

        setTouched({});
        setErrors({});

        setTimeout(() => navigate("/login"), 1500);
      } else {
        setSubmitStatus({
          type: "error",
          message: res.message || "Registration failed",
        });
      }
    } catch (err) {
      setSubmitStatus({
        type: "error",
        message:
          err.response?.data?.message ||
          "Server error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ======================
     UI
  ====================== */

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create Account
        </h1>

        {submitStatus && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              submitStatus.type === "success"
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {submitStatus.message}
          </div>
        )}

        {/* ❗ DO NOT force text color here */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name && errors.name}
            placeholder="Enter full name"
          />

          <FormInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email && errors.email}
            placeholder="Enter email"
          />

          <PhoneInput
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.phone && errors.phone}
          />

          <PasswordInput
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password && errors.password}
          />

          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={
              touched.confirmPassword &&
              errors.confirmPassword
            }
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold
            hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSubmitting
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
