// src/pages/Monitor.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getBatches, addEnvLog, getEnvLogs } from "../firebase/db";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";

const OPTIMAL = { tempMin: 24, tempMax: 28, humidMin: 70, humidMax: 85 };

export default function Monitor() {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({ temperature: "", humidity: "", ventilation: "Good" });

  const [loading, setLoading] = useState(false);

  const DEMO_BATCHES = [
    { id: "demo1", name: "Batch B1", breed: "Bivoltine" },
    { id: "demo2", name: "Batch B2", breed: "Multivoltine" }
  ];

  const displayBatches = batches.length > 0 ? batches : DEMO_BATCHES;

  useEffect(() => {
    if (user) {
      getBatches(user.uid)
        .then(b => {
          console.log("Monitor: Batches loaded", b.length);
          setBatches(b);
        })
        .catch(err => console.error("Monitor: Error fetching batches", err));
    }
  }, [user]);

  // For Demo Mode: if no batch is selected and we have demo batches, auto-select first
  useEffect(() => {
    if (displayBatches.length > 0 && !selectedBatch) {
      setSelectedBatch(displayBatches[0].id);
    }
  }, [displayBatches, selectedBatch]);

  useEffect(() => {
    if (selectedBatch && user) {
      console.log("Monitor: Fetching logs for batch", selectedBatch);
      getEnvLogs(user.uid, selectedBatch)
        .then(l => {
          console.log("Monitor: Logs loaded", l.length);
          setLogs(l);
        })
        .catch(err => console.error("Monitor: Error fetching logs", err));
    }
  }, [selectedBatch, user]);

  const DEMO_LOGS = [
    { temperature: 26.5, humidity: 78, ventilation: "Good", loggedAt: { seconds: Date.now()/1000 } },
    { temperature: 27.2, humidity: 80, ventilation: "Good", loggedAt: { seconds: (Date.now()-86400000)/1000 } },
    { temperature: 25.8, humidity: 75, ventilation: "Good", loggedAt: { seconds: (Date.now()-172800000)/1000 } },
    { temperature: 26.1, humidity: 82, ventilation: "Average", loggedAt: { seconds: (Date.now()-259200000)/1000 } },
    { temperature: 27.5, humidity: 79, ventilation: "Good", loggedAt: { seconds: (Date.now()-345600000)/1000 } },
  ];

  const handleLog = async (e) => {
    e.preventDefault();
    if (!selectedBatch) { toast.error("Please select a batch first"); return; }
    
    const temp = parseFloat(form.temperature);
    const humid = parseFloat(form.humidity);
    if (isNaN(temp) || isNaN(humid)) { toast.error("Enter valid numbers"); return; }
    
    // Optimistic UI for Video
    const newLog = { temperature: temp, humidity: humid, ventilation: form.ventilation, loggedAt: { seconds: Date.now()/1000 } };
    setLogs([newLog, ...logs]);
    
    console.log("Monitor: Recording reading...", { selectedBatch, form });
    setLoading(true);
    try {
      await addEnvLog(user.uid, selectedBatch, { temperature: temp, humidity: humid, ventilation: form.ventilation });
      toast.success("Reading recorded!");
      setForm({ temperature: "", humidity: "", ventilation: "Good" });
    } catch (err) {
      console.error("Monitor: Error saving log", err);
    } finally {
      setLoading(false);
    }
  };

  const displayLogs = logs.length > 0 ? logs : DEMO_LOGS;
  const latest = displayLogs[0];
  const tempOk = latest && latest.temperature >= OPTIMAL.tempMin && latest.temperature <= OPTIMAL.tempMax;
  const humidOk = latest && latest.humidity >= OPTIMAL.humidMin && latest.humidity <= OPTIMAL.humidMax;

  const chartData = [...displayLogs].reverse().slice(-7).map((l, i) => ({
    day: `Day ${i + 1}`,
    temp: l.temperature,
    humid: l.humidity,
  }));

  const barWidth = (val, max) => Math.min(100, Math.round((val / max) * 100));

  return (
    <div className="pb-20">
      <div className="bg-green-700 text-white px-4 pt-5 pb-4">
        <div className="font-semibold text-lg">Environment Monitor</div>
        <div className="text-xs opacity-75 mt-0.5">Manual entry · IoT auto-fill coming soon</div>
      </div>

      {/* Batch selector */}
      <div className="px-4 mt-4">
        <label className="text-xs text-gray-500 block mb-1">Select Batch</label>
        <select 
          value={selectedBatch} 
          onChange={e => {
            console.log("Monitor: Batch selected manually", e.target.value);
            setSelectedBatch(e.target.value);
          }}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 bg-white shadow-sm">
          <option value="" disabled>Choose a batch...</option>
          {displayBatches.map(b => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.breed})
            </option>
          ))}
        </select>
        {displayBatches.length === 0 && (
          <div className="text-[10px] text-amber-600 mt-1 ml-1">
            No active batches found. Create one in the Batches tab.
          </div>
        )}
      </div>

      {!selectedBatch && displayBatches.length > 0 && (
        <div className="px-4 mt-8 text-center py-10 bg-gray-50 mx-4 rounded-2xl border border-dashed border-gray-200">
          <div className="text-2xl mb-2">📡</div>
          <div className="text-sm text-gray-500">Select a batch to view environment data</div>
        </div>
      )}

      {/* Current status */}
      {selectedBatch && latest && (
        <div className="px-4 mt-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-700">Current Readings</span>
              <span className={`text-xs px-2 py-1 rounded-full ${tempOk && humidOk ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                {tempOk && humidOk ? "Optimal" : "Attention needed"}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-24 text-xs text-gray-500">Temperature</div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${tempOk ? "bg-green-500" : "bg-amber-400"}`}
                    style={{ width: `${barWidth(latest.temperature, 40)}%` }} />
                </div>
                <div className={`text-xs font-medium w-12 text-right ${tempOk ? "text-green-700" : "text-amber-600"}`}>
                  {latest.temperature}°C
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 text-xs text-gray-500">Humidity</div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${humidOk ? "bg-green-500" : "bg-red-400"}`}
                    style={{ width: `${barWidth(latest.humidity, 100)}%` }} />
                </div>
                <div className={`text-xs font-medium w-12 text-right ${humidOk ? "text-green-700" : "text-red-500"}`}>
                  {latest.humidity}%
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 text-xs text-gray-500">Ventilation</div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-green-500" style={{ width: "80%" }} />
                </div>
                <div className="text-xs font-medium w-12 text-right text-green-700">{latest.ventilation}</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-400">
              Optimal: {OPTIMAL.tempMin}–{OPTIMAL.tempMax}°C · {OPTIMAL.humidMin}–{OPTIMAL.humidMax}% humidity
            </div>
          </div>
        </div>
      )}

      {/* Manual entry */}
      {selectedBatch && (
        <div className="px-4 mt-4">
          <div className="text-xs text-gray-400 uppercase font-semibold mb-2 tracking-wide">Add Reading</div>
          <form onSubmit={handleLog} className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Temperature (°C)</label>
                <input type="number" step="0.1" value={form.temperature} onChange={e => setForm({...form, temperature: e.target.value})}
                  placeholder="26" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 bg-white" required />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Humidity (%)</label>
                <input type="number" step="1" value={form.humidity} onChange={e => setForm({...form, humidity: e.target.value})}
                  placeholder="75" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 bg-white" required />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Ventilation</label>
              <select value={form.ventilation} onChange={e => setForm({...form, ventilation: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 bg-white">
                <option>Good</option><option>Average</option><option>Poor</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-green-700 disabled:bg-green-300 text-white py-2.5 rounded-lg text-sm font-medium">
              {loading ? "Recording..." : "Record Reading"}
            </button>
          </form>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="px-4 mt-4">
          <div className="text-xs text-gray-400 uppercase font-semibold mb-2 tracking-wide">7-Day Trend</div>
          <div className="bg-white border border-gray-100 rounded-xl p-3">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Line type="monotone" dataKey="temp" stroke="#2d7a3a" strokeWidth={2} dot={false} name="Temp °C" />
                <Line type="monotone" dataKey="humid" stroke="#f5a623" strokeWidth={2} dot={false} strokeDasharray="4 3" name="Humidity %" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-4 justify-center mt-1">
              <span className="text-xs text-green-700">— Temperature</span>
              <span className="text-xs text-amber-500">--- Humidity</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
