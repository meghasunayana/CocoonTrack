// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getBatches, getSales, getExpenses } from "../firebase/db";
import { Link } from "react-router-dom";

const MARKET_PRICES = { A: 485, B: 420, C: 350 };

const STAGE_ORDER = ["Egg", "Instar 1-2", "Instar 3-4", "Instar 5", "Spinning", "Harvest"];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [batches, setBatches] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Dashboard: useEffect triggered, user:", user?.uid);
    if (!user) return;

    const timeoutId = setTimeout(() => {
      console.warn("Dashboard: Data fetching taking too long, forcing loading to false");
      setLoading(false);
    }, 5000);

    console.log("Dashboard: Starting data fetch...");
    Promise.all([
      getBatches(user.uid),
      getSales(user.uid),
      getExpenses(user.uid),
    ])
      .then(([b, s, e]) => {
        console.log("Dashboard: Data fetched successfully", { batches: b.length, sales: s.length, expenses: e.length });
        setBatches(b);
        setSales(s);
        setExpenses(e);
      })
      .catch((err) => {
        console.error("Dashboard: Error fetching data", err);
      })
      .finally(() => {
        console.log("Dashboard: Fetching complete");
        clearTimeout(timeoutId);
        setLoading(false);
      });
  }, [user]);

  const DEMO_BATCHES = [
    { id: "demo1", name: "Batch B1", breed: "Bivoltine", currentStage: "Instar 3-4", healthStatus: "good", startDate: "2024-04-10", eggCount: 1500, status: "active" },
    { id: "demo2", name: "Batch B2", breed: "Multivoltine", currentStage: "Egg", healthStatus: "monitor", startDate: "2024-04-25", eggCount: 1200, status: "active" }
  ];

  const displayBatches = batches.length > 0 ? batches : DEMO_BATCHES;
  const activeBatches = displayBatches.filter((b) => b.status === "active");
  const totalRevenue = sales.length > 0 ? sales.reduce((sum, s) => sum + (s.total || 0), 0) : 45200;
  const totalExpenses = expenses.length > 0 ? expenses.reduce((sum, e) => sum + (e.amount || 0), 0) : 12400;

  const stageColor = (stage) => {
    const idx = STAGE_ORDER.indexOf(stage);
    if (idx < 2) return "bg-green-50 text-green-700 border-green-200";
    if (idx < 4) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-teal-50 text-teal-600 border-teal-200";
  };

  const alertColor = (status) => {
    if (status === "good") return "border-l-green-500";
    if (status === "monitor") return "border-l-amber-400";
    return "border-l-red-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-green-700 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-green-700 text-white px-4 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">🐛 CocoonTrack</div>
            <div className="text-xs opacity-75 mt-0.5">
              Welcome back, {user?.phoneNumber || "Farmer"}
            </div>
          </div>
          <button
            onClick={logout}
            className="text-xs bg-white/20 px-3 py-1.5 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Price Ticker */}
      <div className="bg-green-800 text-white text-xs py-2 px-4 overflow-hidden">
        <div className="flex gap-8 animate-pulse">
          <span>Grade A: ₹{MARKET_PRICES.A}/kg ▲</span>
          <span>Grade B: ₹{MARKET_PRICES.B}/kg ▲</span>
          <span>Grade C: ₹{MARKET_PRICES.C}/kg →</span>
          <span>Ramanagara: ₹490/kg ▲</span>
          <span>Mysuru: ₹{MARKET_PRICES.A}/kg →</span>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3 px-4 mt-4">
        {[
          { label: "Active Batches", value: activeBatches.length, color: "text-green-700" },
          { label: "Market Rate/kg", value: `₹${MARKET_PRICES.A}`, color: "text-teal-600" },
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, color: "text-green-700" },
          { label: "Net Profit", value: `₹${(totalRevenue - totalExpenses).toLocaleString()}`, color: "text-green-700" },
        ].map((m) => (
          <div key={m.label} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
            <div className={`text-xl font-semibold ${m.color}`}>{m.value}</div>
            <div className="text-xs text-gray-400 mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Active Batches */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Active Batches
          </h2>
          <Link to="/batches" className="text-xs text-green-700 font-medium">
            View all →
          </Link>
        </div>

        {activeBatches.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 text-center">
            <div className="text-gray-400 text-sm">No active batches</div>
            <Link
              to="/batches"
              className="mt-2 inline-block text-green-700 text-sm font-medium"
            >
              + Create your first batch
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeBatches.slice(0, 3).map((batch) => (
              <div
                key={batch.id}
                className={`bg-white border-l-4 ${alertColor(batch.healthStatus || "good")} border border-gray-100 rounded-xl p-4`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-gray-400">{batch.breed}</div>
                    <div className="font-medium text-gray-800 text-sm mt-0.5">
                      {batch.name}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${stageColor(
                      batch.currentStage
                    )}`}
                  >
                    {batch.currentStage}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Started {batch.startDate} · {batch.eggCount} eggs ·{" "}
                  {batch.estHarvest ? `Est. harvest ${batch.estHarvest}` : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weather widget */}
      <div className="px-4 mt-5">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Today's Weather
        </h2>
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>🌤</span>
            <span>Mysuru · 29°C · Humidity: 72% · Wind: 12 km/h</span>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {[
              { day: "Mon", icon: "☀️", temp: "31°" },
              { day: "Tue", icon: "🌤", temp: "29°" },
              { day: "Wed", icon: "🌧", temp: "25°" },
              { day: "Thu", icon: "⛅", temp: "27°" },
            ].map((w) => (
              <div
                key={w.day}
                className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100"
              >
                <div className="text-xs text-gray-400">{w.day}</div>
                <div className="text-lg my-1">{w.icon}</div>
                <div className="text-xs font-medium">{w.temp}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
