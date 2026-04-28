// src/pages/Login.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const { sendOTP, verifyOTP } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone"); // phone | otp
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phone.startsWith("+")) {
      toast.error("Use international format: +91XXXXXXXXXX");
      return;
    }
    setLoading(true);
    try {
      await sendOTP(phone);
      setStep("otp");
      toast.success("OTP sent!");
    } catch (err) {
      toast.error("Failed to send OTP. Check number.");
      console.error(err);
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOTP(otp);
      toast.success("Welcome to CocoonTrack!");
    } catch (err) {
      toast.error("Wrong OTP. Try again.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center px-6">
      <div id="recaptcha-container"></div>

      <div className="mb-8 text-center">
        <div className="text-5xl mb-3">🐛</div>
        <h1 className="text-2xl font-semibold text-green-700">CocoonTrack</h1>
        <p className="text-gray-500 text-sm mt-1">Silk Farm Manager</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full max-w-sm">
        {step === "phone" ? (
          <form onSubmit={handleSendOTP}>
            <h2 className="text-lg font-medium text-gray-800 mb-1">Sign In</h2>
            <p className="text-sm text-gray-400 mb-5">
              Enter your mobile number to continue
            </p>
            <label className="text-xs text-gray-500 block mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500 mb-4"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 text-white py-3 rounded-lg font-medium text-sm disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <h2 className="text-lg font-medium text-gray-800 mb-1">
              Enter OTP
            </h2>
            <p className="text-sm text-gray-400 mb-5">
              Sent to {phone}{" "}
              <button
                type="button"
                className="text-green-600 underline"
                onClick={() => setStep("phone")}
              >
                Change
              </button>
            </p>
            <label className="text-xs text-gray-500 block mb-1">6-digit OTP</label>
            <input
              type="number"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="------"
              maxLength={6}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500 mb-4 tracking-widest text-center text-lg"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 text-white py-3 rounded-lg font-medium text-sm disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
          </form>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center">
        Silkworm Monitoring & Market Platform
        <br />
        Made for Karnataka silk farmers
      </p>
    </div>
  );
}
