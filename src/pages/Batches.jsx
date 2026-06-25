// src/pages/Batches.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getBatches, createBatch, updateBatch, addBatchLog, getBatchLogs, deleteBatch } from "../firebase/db";
import toast from "react-hot-toast";

const STAGES = ["Egg", "Instar 1-2", "Instar 3-4", "Instar 5", "Spinning", "Harvest"];
const BREEDS = ["Bivoltine", "Multivoltine", "PM x CSR2", "CSR2 x CSR4"];
const SYMPTOMS = ["Yellow spots", "Soft body", "Dark patches", "White fluff", "Slow feeding", "Brown fluid", "Wilting", "Foul smell"];

const DISEASE_MAP = {
  "Yellow spots": { name: "Grasserie (NPV)", treatment: "Remove infected larvae immediately. Disinfect with 2% bleach. Improve ventilation and reduce humidity." },
  "Soft body": { name: "Flacherie", treatment: "Bacterial infection. Improve ventilation, avoid overfeeding. Use 0.3% formalin spray." },
  "Dark patches": { name: "Muscardine", treatment: "Fungal disease. Dust beds with slaked lime. Ensure dry environment." },
  "White fluff": { name: "White Muscardine", treatment: "Remove affected worms, dust with slaked lime. Reduce moisture levels." },
  "Brown fluid": { name: "Nuclear Polyhedrosis", treatment: "Viral disease — no cure. Remove and destroy affected larvae. Disinfect rearing house." },
};

export default function Batches() {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchLogs, setBatchLogs] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [logForm, setLogForm] = useState({ health: "Good", mortality: 0, notes: "", date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(false);
  const [newBatch, setNewBatch] = useState({
    name: "",
    breed: "Bivoltine",
    eggCount: "",
    startDate: "",
    estHarvest: "",
    currentStage: "Egg",
    rearingRoom: "",
    healthStatus: "good",
  });

  useEffect(() => {
    if (user) loadBatches();
  }, [user]);

  const loadBatches = async () => {
    try {
      const data = await getBatches(user.uid);
      setBatches(data);
    } catch (err) {
      console.error("Error loading batches:", err);
      toast.error("Failed to load batches");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("You must be logged in");
    
    console.log("handleCreate: initiating...", newBatch);
    setLoading(true);

    // Optimistic UI for Video
    const demoNewBatch = { id: Date.now().toString(), ...newBatch, status: "active" };
    setBatches([...displayBatches, demoNewBatch]);
    setShowForm(false);
    
    const timeoutId = setTimeout(() => {
      console.warn("handleCreate: Creation is taking too long...");
      setLoading(false);
    }, 8000);

    try {
      await createBatch(user.uid, {
        ...newBatch,
        eggCount: Number(newBatch.eggCount) || 0
      });
      toast.success("Batch created!");
      setNewBatch({ name: "", breed: "Bivoltine", eggCount: "", startDate: "", estHarvest: "", currentStage: "Egg", rearingRoom: "", healthStatus: "good" });
      await loadBatches();
    } catch (err) {
      console.error("handleCreate: error caught", err);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const [saving, setSaving] = useState(false);

  const DEMO_BATCHES = [
    { id: "demo1", name: "Batch B1", breed: "Bivoltine", currentStage: "Instar 3-4", healthStatus: "good", startDate: "2024-04-10", eggCount: 1500, rearingRoom: "Room A", status: "active" },
    { id: "demo2", name: "Batch B2", breed: "Multivoltine", currentStage: "Egg", healthStatus: "monitor", startDate: "2024-04-25", eggCount: 1200, rearingRoom: "Room B", status: "active" }
  ];

  const DEMO_LOGS = [
    { id: "l1", date: "2024-04-27", health: "Good", mortality: 2, notes: "Worms feeding well, active." },
    { id: "l2", date: "2024-04-26", health: "Good", mortality: 0, notes: "Temperature stable." },
    { id: "l3", date: "2024-04-25", health: "Monitor", mortality: 5, notes: "Minor humidity spike." }
  ];

  const displayBatches = batches.length > 0 ? batches : DEMO_BATCHES;
  const handleDeleteBatch = async (batchId) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this batch?"
  );

  if (!confirmDelete) return;

  try {
    await deleteBatch(batchId);

    setBatches((prev) =>
      prev.filter((batch) => batch.id !== batchId)
    );

    toast.success("Batch deleted successfully!");

    if (selectedBatch?.id === batchId) {
      setSelectedBatch(null);
    }

  } catch (err) {
    console.error("Delete failed:", err);
    toast.error("Failed to delete batch");
  }
};

  const handleStageUpdate = async (batchId, newStage) => {
    setSaving(true);
    // Optimistic UI for Video
    const updatedBatches = displayBatches.map(b => b.id === batchId ? { ...b, currentStage: newStage } : b);
    setBatches(updatedBatches);
    if (selectedBatch?.id === batchId) setSelectedBatch({ ...selectedBatch, currentStage: newStage });

    const timeoutId = setTimeout(() => setSaving(false), 8000);
    try {
      await updateBatch(batchId, { currentStage: newStage });
      toast.success("Stage updated!");
      await loadBatches();
    } catch (err) {
      console.error("Error updating stage:", err);
    } finally {
      clearTimeout(timeoutId);
      setSaving(false);
    }
  };

  const openBatch = async (batch) => {
    setSelectedBatch(batch);
    setBatchLogs(DEMO_LOGS); // Always show some logs for video
    if (!user) return;
    try {
      const logs = await getBatchLogs(user.uid, batch.id);
      if (logs.length > 0) setBatchLogs(logs);
    } catch (err) {
      console.error("Error fetching batch logs:", err);
    }
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Optimistic UI for Video
    const newLog = { id: Date.now().toString(), ...logForm };
    setBatchLogs([newLog, ...batchLogs]);

    const timeoutId = setTimeout(() => setSaving(false), 8000);
    try {
      await addBatchLog(user.uid, selectedBatch.id, logForm);
      toast.success("Log saved!");
      setLogForm({ health: "Good", mortality: 0, notes: "", date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      console.error("Error saving batch log:", err);
    } finally {
      clearTimeout(timeoutId);
      setSaving(false);
    }
  };

  const getDiagnosis = () => {
    for (const sym of selectedSymptoms) {
      if (DISEASE_MAP[sym]) return { symptom: sym, ...DISEASE_MAP[sym] };
    }
    return null;
  };

  const stageIdx = (stage) => STAGES.indexOf(stage);
  const diagnosis = getDiagnosis();

  if (selectedBatch) {
    return (
      <div className="pb-20">
        <div className="bg-green-700 text-white px-4 pt-5 pb-4 flex items-center gap-3">
          <button onClick={() => setSelectedBatch(null)} className="text-white/80 text-lg">←</button>
          <div>
            <div className="font-semibold">{selectedBatch.name}</div>
            <div className="text-xs opacity-75">{selectedBatch.breed} · {selectedBatch.eggCount} eggs</div>
          </div>
        </div>

        {/* Lifecycle stages */}
        <div className="px-4 mt-4">
          <div className="text-xs text-gray-400 uppercase font-semibold mb-3 tracking-wide">Lifecycle Stage</div>
          <div className="flex items-center gap-0">
            {STAGES.map((stage, i) => {
              const current = stageIdx(selectedBatch.currentStage);
              const isDone = i < current;
              const isCurrent = i === current;
              return (
                <div key={stage} className="flex-1 flex flex-col items-center" onClick={() => handleStageUpdate(selectedBatch.id, stage)}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold cursor-pointer z-10 relative
                    ${isDone ? "bg-green-600 text-white" : isCurrent ? "bg-amber-100 text-amber-700 border-2 border-amber-400" : "bg-gray-100 text-gray-400 border border-gray-200"}`}>
                    {isDone ? "✓" : i + 1}
                  </div>
                  {i < STAGES.length - 1 && (
                    <div className={`absolute h-0.5 w-full mt-3 ${isDone ? "bg-green-500" : "bg-gray-200"}`} style={{ zIndex: 0 }} />
                  )}
                  <div className={`text-center text-xs mt-1 ${isCurrent ? "text-amber-600 font-medium" : isDone ? "text-green-600" : "text-gray-400"}`}>
                    {stage}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-xs text-gray-400 mt-2 text-center">Tap a stage to update manually</div>
          
          <div className="mt-6">
            <button 
              disabled={saving || stageIdx(selectedBatch.currentStage) >= STAGES.length - 1}
              onClick={() => handleStageUpdate(selectedBatch.id, STAGES[stageIdx(selectedBatch.currentStage) + 1])}
              className="w-full bg-amber-500 disabled:bg-gray-200 text-white py-3 rounded-xl font-semibold shadow-sm flex items-center justify-center gap-2">
              {saving ? "Updating..." : "Move to Next Stage →"}
            </button>
            <button
              onClick={() => handleDeleteBatch(selectedBatch.id)}
              className="w-full mt-3 bg-red-500 text-white py-3 rounded-xl font-semibold shadow-sm">
              Delete Batch
            </button>
          </div>
        </div>

        {/* Daily log */}
        <div className="px-4 mt-5">
          <div className="text-xs text-gray-400 uppercase font-semibold mb-3 tracking-wide">Daily Log</div>
          <form onSubmit={handleLogSubmit} className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-gray-500 block mb-1">Date</label>
                <input type="date" value={logForm.date} onChange={e => setLogForm({...logForm, date: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Health Status</label>
                <select value={logForm.health} onChange={e => setLogForm({...logForm, health: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none focus:border-green-500">
                  <option>Good</option><option>Monitor</option><option>Poor</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Mortality Count</label>
                <input type="number" min="0" value={logForm.mortality}
                  onChange={e => setLogForm({...logForm, mortality: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none focus:border-green-500" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Notes</label>
              <input value={logForm.notes} onChange={e => setLogForm({...logForm, notes: e.target.value})}
                placeholder="Observations..." className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none focus:border-green-500" />
            </div>
            <button type="submit" disabled={saving} className="bg-green-700 disabled:bg-green-300 text-white px-4 py-2 rounded-lg text-sm font-medium">
              {saving ? "Saving..." : "Save Log"}
            </button>
          </form>
        </div>

        {/* Log history */}
        {batchLogs.length > 0 && (
          <div className="px-4 mt-4">
            <div className="text-xs text-gray-400 uppercase font-semibold mb-2 tracking-wide">Log History</div>
            <div className="space-y-2">
              {batchLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="bg-white border border-gray-100 rounded-xl p-3 text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-xs font-medium ${log.health === "Good" ? "text-green-600" : log.health === "Monitor" ? "text-amber-600" : "text-red-500"}`}>
                        {log.health}
                      </span>
                      <div className="text-[10px] text-gray-400 mt-0.5">{log.date || "No date"}</div>
                    </div>
                    <span className="text-xs text-gray-400">Mortality: {log.mortality}</span>
                  </div>
                  {log.notes && <div className="text-xs text-gray-500 mt-1">{log.notes}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disease checker */}
        <div className="px-4 mt-5">
          <div className="text-xs text-gray-400 uppercase font-semibold mb-3 tracking-wide">Disease Checker</div>
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-3">Select visible symptoms:</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {SYMPTOMS.map((s) => (
                <button key={s} type="button"
                  onClick={() => setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${selectedSymptoms.includes(s) ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-600 border-gray-200"}`}>
                  {s}
                </button>
              ))}
            </div>
            {diagnosis ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="text-sm font-medium text-amber-700">Probable: {diagnosis.name}</div>
                <div className="text-xs text-amber-600 mt-1">{diagnosis.treatment}</div>
              </div>
            ) : selectedSymptoms.length > 0 ? (
              <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">No matching disease found. Consult an expert.</div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="bg-green-700 text-white px-4 pt-5 pb-4 flex items-center justify-between">
        <div className="font-semibold text-lg">Batch Management</div>
        <button onClick={() => setShowForm(true)} className="bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg">+ New Batch</button>
      </div>

      {showForm && (
        <div className="px-4 mt-4">
          <form onSubmit={handleCreate} className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
            <div className="font-medium text-sm text-gray-700">Create New Batch</div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Batch Name</label>
              <input required value={newBatch.name} onChange={e => setNewBatch({...newBatch, name: e.target.value})}
                placeholder="e.g. Batch B3" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Breed</label>
                <select value={newBatch.breed} onChange={e => setNewBatch({...newBatch, breed: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none focus:border-green-500">
                  {BREEDS.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Egg Count</label>
                <input required type="number" value={newBatch.eggCount} onChange={e => setNewBatch({...newBatch, eggCount: e.target.value})}
                  placeholder="1200" className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Start Date</label>
                <input required type="date" value={newBatch.startDate} onChange={e => setNewBatch({...newBatch, startDate: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Est. Harvest</label>
                <input type="date" value={newBatch.estHarvest} onChange={e => setNewBatch({...newBatch, estHarvest: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none focus:border-green-500" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Rearing Room</label>
              <input value={newBatch.rearingRoom} onChange={e => setNewBatch({...newBatch, rearingRoom: e.target.value})}
                placeholder="Room 1" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="flex-1 bg-green-700 disabled:bg-green-300 text-white py-2.5 rounded-lg text-sm font-medium">
                {loading ? "Creating..." : "Create Batch"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-500 py-2.5 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="px-4 mt-4 space-y-3">
        {displayBatches.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No batches yet.<br />
            <button onClick={() => setShowForm(true)} className="text-green-700 font-medium mt-2">+ Create your first batch</button>
          </div>
        )}
        {displayBatches.map((batch) => (
          <div key={batch.id} onClick={() => openBatch(batch)}
            className={`bg-white border border-gray-100 border-l-4 ${batch.healthStatus === "poor" ? "border-l-red-400" : batch.healthStatus === "monitor" ? "border-l-amber-400" : "border-l-green-500"} rounded-xl p-4 cursor-pointer active:scale-98`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-gray-400">{batch.breed}</div>
                <div className="font-medium text-gray-800 mt-0.5">{batch.name}</div>
              </div>
              <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-1 rounded-full">
                {batch.currentStage || "Egg"}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {batch.startDate} · {batch.eggCount} eggs · Room: {batch.rearingRoom || "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
