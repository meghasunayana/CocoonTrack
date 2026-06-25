// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getBatches, getSales, getExpenses } from "../firebase/db";
import { Link, useNavigate } from "react-router-dom";

const DEFAULT_MARKET_PRICES = { A: 485, B: 420, C: 350 };

const STAGE_ORDER = ["Egg", "Instar 1-2", "Instar 3-4", "Instar 5", "Spinning", "Harvest"];

const mapWmoToWeather = (code) => {
  const mappings = {
    0: { icon: "☀️", label: "Clear sky" },
    1: { icon: "🌤", label: "Mainly clear" },
    2: { icon: "⛅", label: "Partly cloudy" },
    3: { icon: "☁️", label: "Overcast" },
    45: { icon: "🌫", label: "Fog" },
    48: { icon: "🌫", label: "Depositing rime fog" },
    51: { icon: "🌦", label: "Light drizzle" },
    53: { icon: "🌦", label: "Moderate drizzle" },
    55: { icon: "🌦", label: "Dense drizzle" },
    61: { icon: "🌧", label: "Slight rain" },
    63: { icon: "🌧", label: "Moderate rain" },
    65: { icon: "🌧", label: "Heavy rain" },
    71: { icon: "🌨", label: "Slight snow fall" },
    73: { icon: "🌨", label: "Moderate snow fall" },
    75: { icon: "🌨", label: "Heavy snow fall" },
    80: { icon: "🌦", label: "Slight rain showers" },
    81: { icon: "🌦", label: "Moderate rain showers" },
    82: { icon: "🌧", label: "Violent rain showers" },
    95: { icon: "⛈", label: "Thunderstorm" },
  };
  return mappings[code] || { icon: "🌤", label: "Partly cloudy" };
};

const getDayName = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);
  const [weatherLocationName, setWeatherLocationName] = useState("Mysuru");
  const [marketPrices, setMarketPrices] = useState(DEFAULT_MARKET_PRICES);
  const [ramanagaraPrice, setRamanagaraPrice] = useState(490);
  const [mysuruPrice, setMysuruPrice] = useState(465);

  useEffect(() => {
    const loadLiveMarketPrices = async () => {
      try {
        const res = await fetch("/live_market_data.json");
        if (res.ok) {
          const data = await res.json();
          if (data && data.records) {
            const records = data.records;
            const ramanagaraBiv = records.find(r => r.market === "Ramanagara" && r.type === "Bivoltine Hybrids");
            const ramanagaraCross = records.find(r => r.market === "Ramanagara" && r.type === "Cross Breed");
            
            const ramBivPrice = ramanagaraBiv?.avgPrice || 698;
            const ramCrossPrice = ramanagaraCross?.avgPrice || 556;
            const ramMinCross = ramanagaraCross?.minPrice || 433;
            
            setMarketPrices({
              A: ramBivPrice,
              B: ramCrossPrice,
              C: ramMinCross
            });
            setRamanagaraPrice(ramBivPrice);
            setMysuruPrice(Math.round(ramBivPrice * 0.96));
          }
        }
      } catch (e) {
        console.error("Dashboard: Error fetching live market data fallback", e);
      }
    };
    loadLiveMarketPrices();
  }, []);

  useEffect(() => {
    const fetchWeather = async (lat, lon, isFallback = false) => {
      setWeatherLoading(true);
      setWeatherError(null);
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4`
        );
        if (!response.ok) throw new Error("Weather API call failed");
        const data = await response.json();
        setWeather(data);
        setWeatherLocationName(isFallback ? "Mysuru (Default)" : "Local Rearing House");
      } catch (err) {
        console.error("Weather error:", err);
        setWeatherError("Failed to fetch live weather details.");
      } finally {
        setWeatherLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(latitude, longitude, false);
        },
        (error) => {
          console.warn("Geolocation error, falling back to Mysuru", error);
          fetchWeather(12.2958, 76.6394, true);
        },
        { timeout: 5000 }
      );
    } else {
      fetchWeather(12.2958, 76.6394, true);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const timeoutId = setTimeout(() => setLoading(false), 5000);
    Promise.all([
      getBatches(user.uid),
      getSales(user.uid),
      getExpenses(user.uid),
    ])
      .then(([b, s, e]) => {
        setBatches(b);
        setSales(s);
        setExpenses(e);
      })
      .catch((err) => console.error("Dashboard: Error fetching data", err))
      .finally(() => {
        clearTimeout(timeoutId);
        setLoading(false);
      });
  }, [user]);

  const DEMO_BATCHES = [
    { id: "demo1", name: "Batch B1", breed: "Bivoltine", currentStage: "Instar 3-4", healthStatus: "good", startDate: "2024-04-10", eggCount: 1500, status: "active" },
    { id: "demo2", name: "Batch B2", breed: "Multivoltine", currentStage: "Egg", healthStatus: "monitor", startDate: "2024-04-25", eggCount: 1200, status: "active" },
  ];

  const displayBatches = batches.length > 0 ? batches : DEMO_BATCHES;
  const activeBatches = displayBatches.filter((b) => b.status === "active");
  const totalRevenue = sales.length > 0 ? sales.reduce((sum, s) => sum + (s.total || 0), 0) : 45200;
  const totalExpenses = expenses.length > 0 ? expenses.reduce((sum, e) => sum + (e.amount || 0), 0) : 12400;

  const currentCondition = weather?.current ? mapWmoToWeather(weather.current.weather_code) : { icon: "🌤", label: "Partly cloudy" };
  const currentTemp   = weather?.current ? Math.round(weather.current.temperature_2m) : 29;
  const currentHumid  = weather?.current ? Math.round(weather.current.relative_humidity_2m) : 72;
  const currentWind   = weather?.current ? Math.round(weather.current.wind_speed_10m) : 12;

  const displayForecast = weather?.daily
    ? weather.daily.time.map((time, idx) => ({
        day: getDayName(time),
        icon: mapWmoToWeather(weather.daily.weather_code[idx]).icon,
        temp: `${Math.round(weather.daily.temperature_2m_max[idx])}°`,
      }))
    : [
        { day: "Mon", icon: "☀️", temp: "31°" },
        { day: "Tue", icon: "🌤", temp: "29°" },
        { day: "Wed", icon: "🌧", temp: "25°" },
        { day: "Thu", icon: "⛅", temp: "27°" },
      ];

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

      {/* ── HEADER — language switcher added ── */}
      <div className="bg-green-700 text-white px-4 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">🐛 CocoonTrack</div>
            <div className="text-xs opacity-75 mt-0.5">
              Welcome back, {user?.phoneNumber || "Farmer"}
            </div>
          </div>
          {/* RIGHT SIDE: language switcher + logout */}
          <div className="flex items-center gap-2">
            <button
              onClick={logout}
              className="text-xs bg-white/20 px-3 py-1.5 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Price Ticker */}
      <div className="bg-green-800 text-white text-xs py-2 px-4 overflow-hidden">
        <div className="flex gap-8 animate-pulse">
           <span>Grade A: ₹{marketPrices.A}/kg ▲</span>
          <span>Grade B: ₹{marketPrices.B}/kg ▲</span>
          <span>Grade C: ₹{marketPrices.C}/kg →</span>
          <span>Ramanagara: ₹{ramanagaraPrice}/kg ▲</span>
          <span>Mysuru: ₹{mysuruPrice}/kg →</span>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3 px-4 mt-4">
        {[
          { label: "Active Batches",  value: activeBatches.length,                          color: "text-green-700" },
          { label: "Market Rate/kg",  value: `₹${marketPrices.A}`,                          color: "text-teal-600"  },
          { label: "Total Revenue",   value: `₹${totalRevenue.toLocaleString()}`,            color: "text-green-700" },
          { label: "Net Profit",      value: `₹${(totalRevenue - totalExpenses).toLocaleString()}`, color: "text-green-700" },
        ].map((m) => (
          <div key={m.label} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
            <div className={`text-xl font-semibold ${m.color}`}>{m.value}</div>
            <div className="text-xs text-gray-400 mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* ── AI FEATURE CARD ── */}
      <div className="mx-4 mt-4 bg-gradient-to-br from-green-800 to-green-600
           text-white rounded-2xl p-5 relative overflow-hidden">
        {/* decorative emoji */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-6xl opacity-10 select-none">
          🐛
        </div>
        <div className="text-xs opacity-75 mb-1">✨ AI Feature</div>
        <div className="text-base font-semibold mb-1">Analyse Your Cocoons</div>
        <div className="text-xs opacity-80 leading-relaxed mb-4">
          Upload a photo to instantly detect stage —{" "}
          Spinning, Developing, Ready, or Overdue.
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/analyze")}
            className="bg-white text-green-800 text-xs font-semibold px-4 py-2.5 rounded-xl"
          >
            📷 Upload Photo
          </button>
          <button
            onClick={() => navigate("/batches")}
            className="bg-white/20 border border-white/30 text-white text-xs font-medium px-4 py-2.5 rounded-xl"
          >
            Track Batches →
          </button>
        </div>
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
            <Link to="/batches" className="mt-2 inline-block text-green-700 text-sm font-medium">
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
                    <div className="font-medium text-gray-800 text-sm mt-0.5">{batch.name}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border ${stageColor(batch.currentStage)}`}>
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
          {weatherLoading ? (
            <div className="flex items-center justify-center py-4 text-xs text-gray-400 gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700" />
              <span>Detecting location & loading weather...</span>
            </div>
          ) : weatherError ? (
            <div className="text-xs text-red-500 py-2">⚠️ {weatherError} Showing default for Mysuru.</div>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm text-gray-600 border-b border-gray-50 pb-2 mb-3">
                <div className="flex items-center gap-1.5 font-medium text-gray-800">
                  <span>📍</span>
                  <span>{weatherLocationName}</span>
                </div>
                <div className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  {currentCondition.label}
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="text-2xl">{currentCondition.icon}</span>
                <span className="font-semibold text-gray-800">{currentTemp}°C</span>
                <span>·</span>
                <span>Humidity: {currentHumid}%</span>
                <span>·</span>
                <span>Wind: {currentWind} km/h</span>
              </div>
            </>
          )}

          <div className="grid grid-cols-4 gap-2 mt-4">
            {displayForecast.map((w, idx) => (
              <div
                key={`${w.day}-${idx}`}
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
