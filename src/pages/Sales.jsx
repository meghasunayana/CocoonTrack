// src/pages/Sales.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { addSale, getSales, addExpense, getExpenses } from "../firebase/db";
import toast from "react-hot-toast";

const EXPENSE_CATS = ["Feed (Mulberry)", "Disinfectants", "Labor", "Equipment", "Transport", "Other"];

export default function Sales() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [tab, setTab] = useState("sales"); // sales | expenses | summary
  const [saleForm, setSaleForm] = useState({ buyer: "", grade: "A", weight: "", pricePerKg: "", batchId: "" });
  const [expForm, setExpForm] = useState({ category: "Feed (Mulberry)", amount: "", notes: "" });
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [showExpForm, setShowExpForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const DEMO_SALES = [
    { id: "s1", buyer: "Ramanagara Silk Exchange", grade: "A", weight: 120, pricePerKg: 495, total: 59400 },
    { id: "s2", buyer: "Mysuru Market", grade: "B", weight: 85, pricePerKg: 420, total: 35700 }
  ];

  const DEMO_EXPENSES = [
    { id: "e1", category: "Feed (Mulberry)", amount: 5000, notes: "Weekly mulberry purchase" },
    { id: "e2", category: "Disinfectants", amount: 1200, notes: "Bleaching powder & lime" },
    { id: "e3", category: "Labor", amount: 3000, notes: "Cleaning & harvesting help" }
  ];

  useEffect(() => {
    if (!user) return;
    setLoadingData(true);
    console.log("Sales: Fetching records from Firestore...");
    Promise.all([getSales(user.uid), getExpenses(user.uid)])
      .then(([s, e]) => {
        console.log("Sales: Success, fetched records:", { sales: s.length, expenses: e.length });
        setSales(s);
        setExpenses(e);
      })
      .catch((err) => {
        console.error("Sales: Error loading records from Firestore", err);
        toast.error("Failed to load records from Firestore");
      })
      .finally(() => {
        setLoadingData(false);
      });
  }, [user]);

  const isUsingDemo = sales.length === 0 && expenses.length === 0 && !loadingData;
  const displaySales = sales.length > 0 ? sales : (isUsingDemo ? DEMO_SALES : []);
  const displayExpenses = expenses.length > 0 ? expenses : (isUsingDemo ? DEMO_EXPENSES : []);

  const totalRevenue = displaySales.reduce((s, x) => s + (x.total || 0), 0);
  const totalExpenses = displayExpenses.reduce((s, x) => s + (x.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const margin = totalRevenue ? Math.round((netProfit / totalRevenue) * 100) : 0;

  const saleTotal = () => {
    const w = parseFloat(saleForm.weight) || 0;
    const p = parseFloat(saleForm.pricePerKg) || 0;
    return (w * p).toFixed(0);
  };

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    const total = parseFloat(saleTotal());
    setSaving(true);
    // Optimistic UI
    const newSale = { id: Date.now().toString(), ...saleForm, total, weight: parseFloat(saleForm.weight), pricePerKg: parseFloat(saleForm.pricePerKg) };
    setSales([newSale, ...sales]);
    setShowSaleForm(false);

    try {
      await addSale(user.uid, { ...saleForm, weight: parseFloat(saleForm.weight), pricePerKg: parseFloat(saleForm.pricePerKg), total });
      toast.success("Sale recorded!");
      setSaleForm({ buyer: "", grade: "A", weight: "", pricePerKg: "", batchId: "" });
    } catch (err) {
      console.error("Sales: Error saving sale", err);
    } finally {
      setSaving(false);
    }
  };

  const handleExpSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    // Optimistic UI
    const newExp = { id: Date.now().toString(), ...expForm, amount: parseFloat(expForm.amount) };
    setExpenses([newExp, ...expenses]);
    setShowExpForm(false);

    try {
      await addExpense(user.uid, { ...expForm, amount: parseFloat(expForm.amount) });
      toast.success("Expense recorded!");
      setExpForm({ category: "Feed (Mulberry)", amount: "", notes: "" });
    } catch (err) {
      console.error("Sales: Error saving expense", err);
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <div className="pb-20">
        <div className="bg-green-700 text-white px-4 pt-5 pb-4">
          <div className="font-semibold text-lg">Sales & Income</div>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-green-700">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mb-2"></div>
          <div className="text-sm">Loading records...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="bg-green-700 text-white px-4 pt-5 pb-4">
        <div className="font-semibold text-lg">Sales & Income</div>
      </div>

      {isUsingDemo && (
        <div className="mx-4 mt-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl p-3 flex items-start gap-2">
          <span>💡</span>
          <div>
            <strong>Demo Mode:</strong> Showing sample records because your database is empty. Click <strong>+ Log Sale</strong> or <strong>+ Add Expense</strong> to start tracking your own.
          </div>
        </div>
      )}

      {/* Summary metrics */}
      <div className="grid grid-cols-2 gap-3 px-4 mt-4">
        {[
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, color: "text-green-700" },
          { label: "Total Expenses", value: `₹${totalExpenses.toLocaleString()}`, color: "text-red-500" },
          { label: "Net Profit", value: `₹${netProfit.toLocaleString()}`, color: netProfit >= 0 ? "text-green-700" : "text-red-500" },
          { label: "Profit Margin", value: `${margin}%`, color: margin >= 60 ? "text-green-700" : "text-amber-600" },
        ].map((m) => (
          <div key={m.label} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
            <div className={`text-xl font-semibold ${m.color}`}>{m.value}</div>
            <div className="text-xs text-gray-400 mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex mx-4 mt-4 border border-gray-200 rounded-xl overflow-hidden">
        {["sales", "expenses", "summary"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${tab === t ? "bg-green-700 text-white" : "bg-white text-gray-500"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* SALES TAB */}
      {tab === "sales" && (
        <div className="px-4 mt-3">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Sale Records</div>
            <button onClick={() => setShowSaleForm(!showSaleForm)} className="text-xs bg-green-700 text-white px-3 py-1.5 rounded-lg">+ Log Sale</button>
          </div>

          {showSaleForm && (
            <form onSubmit={handleSaleSubmit} className="bg-white border border-gray-100 rounded-xl p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Buyer Name</label>
                  <input required value={saleForm.buyer} onChange={e => setSaleForm({...saleForm, buyer: e.target.value})}
                    placeholder="Market / Buyer" className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Grade</label>
                  <select value={saleForm.grade} onChange={e => setSaleForm({...saleForm, grade: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none focus:border-green-500">
                    <option>A</option><option>B</option><option>C</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Weight (kg)</label>
                  <input required type="number" step="0.1" value={saleForm.weight} onChange={e => setSaleForm({...saleForm, weight: e.target.value})}
                    placeholder="12.5" className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Price/kg (₹)</label>
                  <input required type="number" value={saleForm.pricePerKg} onChange={e => setSaleForm({...saleForm, pricePerKg: e.target.value})}
                    placeholder="485" className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none focus:border-green-500" />
                </div>
              </div>
              {saleForm.weight && saleForm.pricePerKg && (
                <div className="bg-green-50 text-green-700 text-sm text-center py-2 rounded-lg font-medium">
                  Total: ₹{parseInt(saleTotal()).toLocaleString()}
                </div>
              )}
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="flex-1 bg-green-700 disabled:bg-green-300 text-white py-2.5 rounded-lg text-sm font-medium">
                  {saving ? "Saving..." : "Save Sale"}
                </button>
                <button type="button" onClick={() => setShowSaleForm(false)} className="flex-1 border border-gray-200 text-gray-500 py-2.5 rounded-lg text-sm">Cancel</button>
              </div>
            </form>
          )}

          {displaySales.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No sales yet</div>
          ) : (
            <div className="space-y-2">
              {displaySales.map((s) => (
                <div key={s.id} className="bg-white border border-gray-100 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{s.buyer}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Grade {s.grade} · {s.weight}kg · ₹{s.pricePerKg}/kg</div>
                  </div>
                  <div className="text-sm font-semibold text-green-700">₹{(s.total || 0).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EXPENSES TAB */}
      {tab === "expenses" && (
        <div className="px-4 mt-3">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Expenses</div>
            <button onClick={() => setShowExpForm(!showExpForm)} className="text-xs bg-green-700 text-white px-3 py-1.5 rounded-lg">+ Add Expense</button>
          </div>

          {showExpForm && (
            <form onSubmit={handleExpSubmit} className="bg-white border border-gray-100 rounded-xl p-4 mb-4 space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Category</label>
                <select value={expForm.category} onChange={e => setExpForm({...expForm, category: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500">
                  {EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Amount (₹)</label>
                <input required type="number" value={expForm.amount} onChange={e => setExpForm({...expForm, amount: e.target.value})}
                  placeholder="500" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Notes</label>
                <input value={expForm.notes} onChange={e => setExpForm({...expForm, notes: e.target.value})}
                  placeholder="Optional" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="flex-1 bg-green-700 disabled:bg-green-300 text-white py-2.5 rounded-lg text-sm font-medium">
                  {saving ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={() => setShowExpForm(false)} className="flex-1 border border-gray-200 text-gray-500 py-2.5 rounded-lg text-sm">Cancel</button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {displayExpenses.map((e) => (
              <div key={e.id} className="bg-white border border-gray-100 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-800">{e.category}</div>
                  {e.notes && <div className="text-xs text-gray-400 mt-0.5">{e.notes}</div>}
                </div>
                <div className="text-sm font-semibold text-red-500">-₹{(e.amount || 0).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUMMARY TAB */}
      {tab === "summary" && (
        <div className="px-4 mt-3">
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="text-sm font-medium text-gray-700 mb-3">Profit & Loss Summary</div>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-gray-50 text-sm">
                <span className="text-gray-500">Cocoon Sales</span>
                <span className="text-green-700 font-medium">+₹{totalRevenue.toLocaleString()}</span>
              </div>
              {Object.entries(
                displayExpenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {})
              ).map(([cat, amt]) => (
                <div key={cat} className="flex justify-between py-2 border-b border-gray-50 text-sm">
                  <span className="text-gray-500">{cat}</span>
                  <span className="text-red-500">-₹{amt.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 text-base font-semibold">
                <span>Net Profit</span>
                <span className={netProfit >= 0 ? "text-green-700" : "text-red-500"}>₹{netProfit.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
