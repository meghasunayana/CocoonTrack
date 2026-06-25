// src/firebase/db.js
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "./config";

const getMillis = (ts) => {
  if (!ts) return Date.now(); // If timestamp is null (pending), treat as newest
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (ts instanceof Date) return ts.getTime();
  if (ts.seconds) return ts.seconds * 1000;
  return Date.now();
};

// ─── BATCHES ───────────────────────────────────────────────
export const createBatch = async (userId, data) => {
  console.log("createBatch: starting...", { userId, data });
  try {
    const docRef = await addDoc(collection(db, "batches"), {
      ...data,
      userId,
      createdAt: serverTimestamp(),
      status: "active",
    });
    console.log("createBatch: success, ID:", docRef.id);
    return docRef;
  } catch (error) {
    console.error("createBatch: error:", error);
    throw error;
  }
};

export const getBatches = async (userId) => {
  try {
    const q = query(collection(db, "batches"), where("userId", "==", userId));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return data.sort((a, b) => getMillis(b.createdAt) - getMillis(a.createdAt));
  } catch (error) {
    console.error("getBatches: error:", error);
    throw error;
  }
};

export const updateBatch = async (batchId, data) => {
  return await updateDoc(doc(db, "batches", batchId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteBatch = async (batchId) => {
  return await deleteDoc(doc(db, "batches", batchId));
};

// ─── ENVIRONMENT LOGS ──────────────────────────────────────
export const addEnvLog = async (userId, batchId, data) => {
  console.log("addEnvLog: starting...", { userId, batchId, data });
  try {
    const docRef = await addDoc(collection(db, "envLogs"), {
      ...data,
      userId,
      batchId,
      loggedAt: serverTimestamp(),
    });
    console.log("addEnvLog: success", docRef.id);
    return docRef;
  } catch (error) {
    console.error("addEnvLog: error", error);
    throw error;
  }
};

export const getEnvLogs = async (userId, batchId) => {
  try {
    const q = query(collection(db, "envLogs"), where("userId", "==", userId));
    const snap = await getDocs(q);
    const data = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((log) => log.batchId === batchId);
    return data.sort((a, b) => getMillis(b.loggedAt) - getMillis(a.loggedAt));
  } catch (error) {
    console.error("getEnvLogs error:", error);
    throw error;
  }
};

// ─── SALES ─────────────────────────────────────────────────
export const addSale = async (userId, data) => {
  return await addDoc(collection(db, "sales"), {
    ...data,
    userId,
    saleDate: serverTimestamp(),
  });
};

export const getSales = async (userId) => {
  try {
    const q = query(collection(db, "sales"), where("userId", "==", userId));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return data.sort((a, b) => getMillis(b.saleDate) - getMillis(a.saleDate));
  } catch (error) {
    console.error("getSales error:", error);
    throw error;
  }
};

// ─── EXPENSES ──────────────────────────────────────────────
export const addExpense = async (userId, data) => {
  return await addDoc(collection(db, "expenses"), {
    ...data,
    userId,
    date: serverTimestamp(),
  });
};

export const getExpenses = async (userId) => {
  try {
    const q = query(collection(db, "expenses"), where("userId", "==", userId));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return data.sort((a, b) => getMillis(b.date) - getMillis(a.date));
  } catch (error) {
    console.error("getExpenses error:", error);
    throw error;
  }
};

// ─── DAILY BATCH LOGS ──────────────────────────────────────
export const addBatchLog = async (userId, batchId, data) => {
  console.log("addBatchLog: starting...", { userId, batchId, data });
  try {
    const docRef = await addDoc(collection(db, "batchLogs"), {
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
      mortality: Number(data.mortality) || 0,
      userId,
      batchId,
      loggedAt: serverTimestamp(),
    });
    console.log("addBatchLog: success", docRef.id);
    return docRef;
  } catch (error) {
    console.error("addBatchLog: error", error);
    throw error;
  }
};

export const getBatchLogs = async (userId, batchId) => {
  try {
    const q = query(collection(db, "batchLogs"), where("userId", "==", userId));
    const snap = await getDocs(q);
    const data = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((log) => log.batchId === batchId);
    return data.sort((a, b) => getMillis(b.loggedAt) - getMillis(a.loggedAt));
  } catch (error) {
    console.error("getBatchLogs error:", error);
    throw error;
  }
};

// ─── PRICE ALERTS ──────────────────────────────────────────
export const createPriceAlert = async (userId, data) => {
  console.log("createPriceAlert: starting...", { userId, data });
  try {
    const docRef = await addDoc(collection(db, "priceAlerts"), {
      ...data,
      userId,
      createdAt: serverTimestamp(),
    });
    console.log("createPriceAlert: success", docRef.id);
    return docRef;
  } catch (error) {
    console.error("createPriceAlert error:", error);
    throw error;
  }
};

export const getPriceAlerts = async (userId) => {
  try {
    const q = query(collection(db, "priceAlerts"), where("userId", "==", userId));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return data.sort((a, b) => getMillis(b.createdAt) - getMillis(a.createdAt));
  } catch (error) {
    console.error("getPriceAlerts error:", error);
    throw error;
  }
};

export const deletePriceAlert = async (alertId) => {
  try {
    await deleteDoc(doc(db, "priceAlerts", alertId));
    console.log("deletePriceAlert: success", alertId);
  } catch (error) {
    console.error("deletePriceAlert error:", error);
    throw error;
  }
};

