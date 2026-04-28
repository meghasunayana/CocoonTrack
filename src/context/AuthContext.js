// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase/config";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmResult, setConfirmResult] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );
    }
  };

  const sendOTP = async (phoneNumber) => {
    setupRecaptcha();
    const result = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      window.recaptchaVerifier
    );
    setConfirmResult(result);
    return result;
  };

  const verifyOTP = async (otp) => {
    if (!confirmResult) throw new Error("No OTP sent");
    return await confirmResult.confirm(otp);
  };

  const logout = () => signOut(auth);

  const value = {
    user,
    loading,
    sendOTP,
    verifyOTP,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
