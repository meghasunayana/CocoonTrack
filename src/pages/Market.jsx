// src/pages/Market.jsx
import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { createPriceAlert, getPriceAlerts, deletePriceAlert } from "../firebase/db";

const GRADES = {
  A: { price: 485, change: +12, trend: "up" },
  B: { price: 420, change: +5, trend: "up" },
  C: { price: 350, change: 0, trend: "stable" },
};

const MARKETS = [
  { name: "Ramanagara Market", dist: "62 km", price: 490, hours: "7AM–2PM", badge: "Best Price" },
  { name: "Mysuru Silk Market", dist: "8 km", price: 480, hours: "6AM–1PM", badge: null },
  { name: "Channapatna Market", dist: "74 km", price: 478, hours: "7AM–1PM", badge: null },
  { name: "Kollegal Market", dist: "120 km", price: 495, hours: "8AM–3PM", badge: "Highest" },
];

// Simulated 30-day price history
const generateHistory = (base) =>
  Array.from({ length: 14 }, (_, i) => ({
    day: `Apr ${i + 13}`,
    price: base - 20 + Math.round(Math.random() * 30 + i * 1.2),
  }));

export default function Market() {
  const { user } = useAuth();
  const [activeGrade, setActiveGrade] = useState("A");
  const [alertPrice, setAlertPrice] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);

  const history = generateHistory(GRADES[activeGrade].price);

  useEffect(() => {
    if (!user) return;
    loadAlerts();
  }, [user]);

  const loadAlerts = async () => {
    setAlertsLoading(true);
    try {
      const data = await getPriceAlerts(user.uid);
      setAlerts(data);
    } catch (err) {
      console.error("Error loading alerts:", err);
    } finally {
      setAlertsLoading(false);
    }
  };

  const handleSetAlert = async () => {
    if (!alertPrice) { toast.error("Enter a price"); return; }
    if (!user) { toast.error("You must be logged in to set alerts"); return; }
    
    const priceVal = parseFloat(alertPrice);
    if (isNaN(priceVal) || priceVal <= 0) { toast.error("Enter a valid price"); return; }

    const tempId = Date.now().toString();
    const newAlert = { id: tempId, alertPrice: priceVal, grade: activeGrade, createdAt: new Date() };
    setAlerts([newAlert, ...alerts]);
    toast.success(`Alert set for ₹${priceVal}/kg`);
    setAlertPrice("");

    try {
      await createPriceAlert(user.uid, {
        alertPrice: priceVal,
        grade: activeGrade
      });
      loadAlerts();
    } catch (err) {
      console.error("Error setting alert in database:", err);
      toast.error("Failed to save alert in database");
      setAlerts(prev => prev.filter(a => a.id !== tempId));
    }
  };

  const handleDeleteAlert = async (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    toast.success("Alert deleted");

    try {
      await deletePriceAlert(alertId);
      loadAlerts();
    } catch (err) {
      console.error("Error deleting alert:", err);
      toast.error("Failed to delete alert from database");
      loadAlerts();
    }
  };

  return (
    <div className="pb-20">
      <div className="bg-green-700 text-white px-4 pt-5 pb-4">
        <div className="font-semibold text-lg">Market Prices</div>
        <div className="text-xs opacity-75 mt-0.5">Live cocoon rates · Karnataka markets</div>
      </div>

      {/* Hero price */}
      <div className="mx-4 mt-4 bg-gradient-to-br from-green-700 to-green-600 text-white rounded-2xl p-5">
        <div className="text-xs opacity-75">Grade {activeGrade} Cocoon · Today</div>
        <div className="text-3xl font-semibold mt-1">
          ₹{GRADES[activeGrade].price}
          <span className="text-sm font-normal opacity-75 ml-1">/kg</span>
        </div>
        <div className="text-xs mt-1 opacity-80">
          {GRADES[activeGrade].change > 0 ? "▲" : GRADES[activeGrade].change < 0 ? "▼" : "→"}{" "}
          ₹{Math.abs(GRADES[activeGrade].change)} from yesterday · Ramanagara Market
        </div>
      </div>

      {/* Grade tabs */}
      <div className="flex mx-4 mt-4 border border-gray-200 rounded-xl overflow-hidden">
        {Object.keys(GRADES).map((g) => (
          <button key={g} onClick={() => setActiveGrade(g)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${activeGrade === g ? "bg-green-700 text-white" : "bg-white text-gray-500"}`}>
            Grade {g}
          </button>
        ))}
      </div>

      {/* Price chart */}
      <div className="px-4 mt-4">
        <div className="bg-white border border-gray-100 rounded-xl p-3">
          <div className="text-xs text-gray-400 mb-2">14-day price trend — Grade {activeGrade}</div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#9ca3af" }} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} domain={["auto", "auto"]} />
              <Tooltip formatter={(v) => [`₹${v}`, "Price"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="price" stroke="#2d7a3a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Price alert */}
      <div className="px-4 mt-4">
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <div className="text-sm font-medium text-amber-700 mb-2">🔔 Set Price Alert (Grade {activeGrade})</div>
          <div className="flex gap-2 mb-3">
            <input type="number" value={alertPrice} onChange={e => setAlertPrice(e.target.value)}
              placeholder="Notify when price ≥ ₹" className="flex-1 border border-amber-200 bg-white rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400" />
            <button onClick={handleSetAlert} className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium">Set</button>
          </div>

          {/* Active Alerts List */}
          {user && (
            <div className="border-t border-amber-200/50 pt-3 mt-3">
              <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">Active Target Alerts</div>
              {alertsLoading && alerts.length === 0 ? (
                <div className="text-xs text-amber-600/70 py-1">Loading alerts...</div>
              ) : alerts.length === 0 ? (
                <div className="text-xs text-amber-600/70 py-1">No target price alerts configured yet.</div>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {alerts.map((a) => (
                    <div key={a.id} className="flex justify-between items-center bg-white border border-amber-100 rounded-lg px-3 py-1.5 text-xs text-gray-700 shadow-sm">
                      <span className="font-medium">Grade {a.grade}: ≥ ₹{a.alertPrice}/kg</span>
                      <button onClick={() => handleDeleteAlert(a.id)} className="text-red-500 hover:text-red-700 font-bold px-1 py-0.5" title="Delete Alert">
                        🗑
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Nearby markets */}
      <div className="px-4 mt-4">
        <div className="text-xs text-gray-400 uppercase font-semibold mb-2 tracking-wide">Nearby Markets</div>
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50">
          {MARKETS.map((m) => (
            <div key={m.name} className="flex items-center gap-3 p-4">
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-lg flex-shrink-0">📍</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">{m.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{m.dist} · ₹{m.price}/kg · {m.hours}</div>
              </div>
              {m.badge && (
                <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-1 rounded-full whitespace-nowrap">
                  {m.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Market tips */}
      <div className="px-4 mt-4">
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 text-sm text-teal-700">
          <div className="font-medium mb-1">💡 Market Tips</div>
          <ul className="text-xs space-y-1 text-teal-600">
            <li>• Grade A cocoons fetch 15–20% more than Grade B</li>
            <li>• Ramanagara consistently offers 3–5% above Mysuru</li>
            <li>• Best selling time: 7AM–10AM (peak buyer activity)</li>
            <li>• Dry cocoons weigh less — sell within 24h of harvest</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
