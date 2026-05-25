// src/components/AIAnalyzer.jsx
// Teachable Machine model lives in /src/ai-model/ (model.json + weights.bin + metadata.json)

import React, { useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as tmImage from "@teachablemachine/image";
import { useNavigate } from "react-router-dom";

// ─── Per-class analysis data ────────────────────────────────────────────────
const CLASS_DATA = {
  spinning: {
    label: "Spinning in Progress",
    color: "#3B82F6",
    bg: "#EFF6FF",
    urgency: "low",
    urgencyLabel: "No action needed",
    urgencyColor: "#3B82F6",
    fields: [
      { label: "Stage Status", value: "Silk deposition in progress", sub: "Worm is actively forming the cocoon shell" },
      { label: "Shell Completeness", value: "Estimated 10–30%", sub: "Outer layer not yet sealed" },
      { label: "Days Since Spinning", value: "Day 0–2 (estimated)", sub: "Based on shell formation visible" },
      { label: "Days to Harvest", value: "5–7 days remaining", sub: "Under optimal 26°C, 75% humidity" },
      { label: "Disturbance Risk", value: "HIGH — Critical phase", sub: "Any contact can break thread continuity", alert: true },
      { label: "Recommended Action", value: "Observe only. Do not touch.", sub: "Maintain rearing room silence and stable environment" },
    ],
    advice: "Check environment monitor. Ensure temperature is 25–27°C and humidity 70–80% for optimal spinning.",
    appLink: { label: "Open Environment Monitor", route: "/monitor" },
    tip: "This is the most sensitive phase. Even vibrations from footsteps can affect silk thread quality.",
  },

  developing: {
    label: "Developing — Not Yet Ready",
    color: "#EAB308",
    bg: "#FEF9C3",
    urgency: "medium",
    urgencyLabel: "Monitor closely",
    urgencyColor: "#D97706",
    fields: [
      { label: "Stage Status", value: "Shell forming — pupa maturing", sub: "Silk layer thickening, pupa transitioning inside" },
      { label: "Shell Completeness", value: "Estimated 50–75%", sub: "Shell partially opaque, still soft" },
      { label: "Days Since Spinning", value: "Day 3–5 (estimated)", sub: "Mid-stage cocoon formation" },
      { label: "Days to Harvest", value: "2–3 days remaining", sub: "Approaching optimal harvest window" },
      { label: "Preliminary Quality Signal", value: "Shape and size developing normally", sub: "No visible defects detected at this stage" },
      { label: "Risk Factor", value: "Moderate — monitor humidity", sub: "Low humidity now causes thin shell and reduced filament", alert: true },
    ],
    advice: "Log today's environment reading. Humidity drop below 65% at this stage reduces filament quality significantly.",
    appLink: { label: "Log Environment Reading", route: "/monitor" },
    tip: "Maintain steady humidity between 70–85% during this stage. Sudden drops are the leading cause of thin-shelled cocoons.",
  },

  ready: {
    label: "Ready for Harvest",
    color: "#22C55E",
    bg: "#DCFCE7",
    urgency: "action",
    urgencyLabel: "Harvest within 24–48 hours",
    urgencyColor: "#16A34A",
    fields: [
      { label: "Stage Status", value: "Optimal harvest condition", sub: "Pupa fully formed, shell dense and sealed" },
      { label: "Shell Completeness", value: "100% — fully sealed", sub: "Maximum filament continuity achieved" },
      { label: "Visual Quality Indicators", value: "Uniform shape · Clean surface · Dense shell", sub: "Consistent colour, no deformities detected" },
      { label: "Harvest Window", value: "ACTIVE — 24 to 48 hours", sub: "Delay beyond 2 days risks overdue classification", alert: true },
      { label: "Estimated Filament Condition", value: "Good — continuous thread likely", sub: "Shell density suggests high reeling suitability" },
      { label: "Batch Readiness", value: "Proceed to harvest planning", sub: "Cross-check batch log before market visit" },
    ],
    advice: "Update your batch harvest log now. Check market prices and nearby markets before you travel.",
    appLink: { label: "View Market Prices", route: "/market" },
    tip: "Harvest in the early morning (6–8 AM) when temperatures are lower. This preserves filament quality during transport.",
  },

  overdue: {
    label: "Overdue — Harvest Immediately",
    color: "#F97316",
    bg: "#FFF7ED",
    urgency: "urgent",
    urgencyLabel: "Urgent — harvest today",
    urgencyColor: "#DC2626",
    fields: [
      { label: "Stage Status", value: "Post-optimal — pupa deteriorating", sub: "Harvest window has closed. Pupa drying inside." },
      { label: "Shell Condition", value: "Darkened · Slightly papery", sub: "Moisture lost from shell — surface appears dull" },
      { label: "Filament Impact", value: "Reduced — increased breakage risk", sub: "Thread length shorter than at peak harvest" },
      { label: "Estimated Delay", value: "2–4 days beyond optimal window", sub: "Based on shell discolouration and texture analysis" },
      { label: "Urgency Level", value: "HARVEST TODAY", sub: "Further delay reduces saleable value significantly", alert: true },
      { label: "Likely Cause", value: "Missed harvest window", sub: "Consider enabling harvest reminder in next batch" },
    ],
    advice: "Harvest immediately. Update batch status to harvested. The app will show adjusted market expectations based on condition.",
    appLink: { label: "Update Batch Status", route: "/batches" },
    tip: "For future batches, set a harvest reminder alert in the batch screen once your cocoons enter the spinning stage.",
  },
};

// ─── Urgency banner colours ──────────────────────────────────────────────────
const URGENCY_STYLES = {
  low:    { bg: "#EFF6FF", border: "#BFDBFE", text: "#1D4ED8" },
  medium: { bg: "#FFFBEB", border: "#FDE68A", text: "#B45309" },
  action: { bg: "#F0FDF4", border: "#BBF7D0", text: "#15803D" },
  urgent: { bg: "#FEF2F2", border: "#FECACA", text: "#B91C1C" },
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function AIAnalyzer() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [result, setResult] = useState(null); // { className, confidence, data }
  const [error, setError] = useState(null);

  // ── Load model and predict ─────────────────────────────────────────────────
  const analyzeImage = async (imageElement) => {
    setLoading(true);
    setError(null);

    try {
      setLoadingMsg("Loading AI model...");
      const modelURL = "/ai-model/model.json";
      const metadataURL = "/ai-model/metadata.json";
      const model = await tmImage.load(modelURL, metadataURL);

      setLoadingMsg("Analysing cocoon image...");
      const predictions = await model.predict(imageElement);

      // Sort by probability, get top result
      const sorted = [...predictions].sort((a, b) => b.probability - a.probability);
      const top = sorted[0];

      // Normalise class name to match our keys
      const className = top.className.toLowerCase().trim();
      const confidence = Math.round(top.probability * 100);
      const data = CLASS_DATA[className];

      if (!data) throw new Error(`Unknown class: ${className}`);

      setResult({ className, confidence, data, allPredictions: sorted });
    } catch (err) {
      console.error(err);
      setError("Could not analyse image. Ensure the model files are in /public/ai-model/");
    }

    setLoading(false);
  };

  // ── Handle file upload ─────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setResult(null);
    setError(null);

    const img = new Image();
    img.src = url;
    img.onload = () => analyzeImage(img);
  };

 const handleRetake = () => {
  setPreview(null);
  setResult(null);
  setError(null);

  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
};

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-green-700 text-white px-4 pt-5 pb-4">
        <div className="font-semibold text-lg">AI Cocoon Analyser</div>
        <div className="text-xs opacity-75 mt-0.5">
          Upload a photo to detect stage and get analysis
        </div>
      </div>

      {/* Upload zone */}
      {!preview && (
        <div className="mx-4 mt-5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
            id="cocoon-upload"
          />
          <label
            htmlFor="cocoon-upload"
            className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-green-300 rounded-2xl py-12 px-6 cursor-pointer bg-green-50 active:bg-green-100 transition-colors"
          >
            <div className="text-4xl">📷</div>
            <div className="text-sm font-medium text-green-700">
              Upload or take a photo
            </div>
            <div className="text-xs text-gray-400 text-center">
              Place cocoon against a plain background.
              <br />
              Good lighting improves accuracy.
            </div>
            <div className="bg-green-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl mt-1">
              Choose Photo
            </div>
          </label>

          {/* Tips */}
          <div className="mt-4 bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Photo tips for better accuracy
            </div>
            {[
              "Place cocoon on a white or plain cloth background",
              "Use natural daylight or bright indoor light",
              "Keep camera 10–15 cm from the cocoon",
              "Avoid blurry or dark images",
            ].map((tip) => (
              <div key={tip} className="flex items-start gap-2 text-xs text-gray-500">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image preview */}
      {preview && (
        <div className="mx-4 mt-4">
          <div className="relative">
            <img
              ref={imageRef}
              src={preview}
              alt="Uploaded cocoon"
              className="w-full h-52 object-cover rounded-xl border border-gray-100"
            />
            {!loading && (
              <button
                onClick={handleRetake}
                className="absolute top-2 right-2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-lg"
              >
                Retake
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="mx-4 mt-4 bg-gray-50 border border-gray-100 rounded-xl p-6 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-sm text-gray-600 font-medium">{loadingMsg}</div>
          <div className="text-xs text-gray-400">This may take a few seconds</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ── RESULTS ── */}
      {result && !loading && (
        <div className="mx-4 mt-4 space-y-3">

          {/* Detection result badge */}
          <div
            className="rounded-xl p-4 border"
            style={{
              background: result.data.bg,
              borderColor: result.data.color + "40",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide mb-1"
                  style={{ color: result.data.color }}>
                  AI Detection Result
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {result.data.label}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: result.data.color }}>
                  {result.confidence}%
                </div>
                <div className="text-xs text-gray-400">confidence</div>
              </div>
            </div>

            {/* Confidence bar */}
            <div className="mt-3 h-1.5 bg-white/60 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${result.confidence}%`,
                  background: result.data.color,
                }}
              />
            </div>
          </div>

          {/* Urgency banner */}
          {(() => {
            const s = URGENCY_STYLES[result.data.urgency];
            return (
              <div
                className="rounded-xl px-4 py-3 border flex items-center gap-3"
                style={{ background: s.bg, borderColor: s.border }}
              >
                <div className="text-lg">
                  {result.data.urgency === "urgent" ? "🚨" :
                   result.data.urgency === "action" ? "✅" :
                   result.data.urgency === "medium" ? "⏳" : "ℹ️"}
                </div>
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide"
                    style={{ color: s.text }}>
                    {result.data.urgencyLabel}
                  </div>
                  <div className="text-xs mt-0.5 text-gray-500">{result.data.advice}</div>
                </div>
              </div>
            );
          })()}

          {/* Analysis fields */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Detailed Analysis
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {result.data.fields.map((field) => (
                <div key={field.label} className="px-4 py-3">
                  <div className="text-xs text-gray-400 mb-0.5">{field.label}</div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: field.alert ? "#DC2626" : "inherit" }}
                  >
                    {field.value}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{field.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* All class probabilities */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                All Class Probabilities
              </div>
            </div>
            <div className="px-4 py-3 space-y-2.5">
              {result.allPredictions.map((p) => {
                const pct = Math.round(p.probability * 100);
                const cd = CLASS_DATA[p.className.toLowerCase().trim()];
                return (
                  <div key={p.className}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="capitalize text-gray-600">{p.className}</span>
                      <span className="font-medium text-gray-800">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: cd ? cd.color : "#9CA3AF",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pro tip */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <div className="text-xs font-medium text-amber-700 mb-1">💡 Field Tip</div>
            <div className="text-xs text-amber-600 leading-relaxed">{result.data.tip}</div>
          </div>

          {/* App link — continues to existing screen */}
          <button
            onClick={() => navigate(result.data.appLink.route)}
            className="w-full bg-green-700 text-white py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
          >
            {result.data.appLink.label}
            <span>→</span>
          </button>

          {/* Analyse another */}
          <button
            onClick={handleRetake}
            className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl text-sm"
          >
            Analyse another cocoon
          </button>

          {/* Disclaimer */}
          <div className="text-center text-xs text-gray-300 pb-2">
            AI model accuracy ~70–80% · Results are indicative only
          </div>
        </div>
      )}
    </div>
  );
}
