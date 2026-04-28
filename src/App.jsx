// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import BottomNav from "./components/BottomNav";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Batches from "./pages/Batches";
import Monitor from "./pages/Monitor";
import Market from "./pages/Market";
import Sales from "./pages/Sales";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-green-700 text-sm">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return (
    <div className="max-w-lg mx-auto min-h-screen bg-white relative">
      {children}
      <BottomNav />
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-green-700 text-sm">Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/batches" element={<ProtectedRoute><Batches /></ProtectedRoute>} />
      <Route path="/monitor" element={<ProtectedRoute><Monitor /></ProtectedRoute>} />
      <Route path="/market" element={<ProtectedRoute><Market /></ProtectedRoute>} />
      <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ style: { fontSize: "13px", borderRadius: "10px" } }} />
      <AppRoutes />
    </BrowserRouter>
  );
}
