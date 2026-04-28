# 🐛 CocoonTrack — Silk Farm Manager

A mobile-first React web app for silkworm cocoon farmers to monitor batches, track environment conditions, check market prices, and manage sales & income.

---

## 📱 Features

| Module | What it does |
|---|---|
# CocoonTrack
A smart cocoon monitoring and energy tracking system.
- Real-time monitoring
- Device control
- Energy optimization
| **Dashboard** | Active batch summary, market price ticker, weather widget, alerts |
| **Batch Management** | Create batches, track lifecycle (Egg→Instar→Spinning→Harvest), daily health logs, disease checker with treatment advice |
| **Environment Monitor** | Manual temperature/humidity entry, visual range bars, 7-day trend chart (IoT-ready hook) |
| **Market Prices** | Live grade-wise prices, 14-day chart, price alert setter, nearest market locator |
| **Sales & Income** | Log sales, track expenses by category, P&L summary, profit margin calculation |
| **Auth** | Firebase phone OTP — no email needed |

---

## 🛠 Tech Stack

- **Frontend**: React 18 + Tailwind CSS
- **Auth**: Firebase Authentication (Phone OTP)
- **Database**: Firebase Firestore (real-time, per-user data)
- **Charts**: Recharts
- **Deployment**: Vercel (frontend)
- **Version Control**: GitHub
## Tech Stack Overview:
- React  
- Tailwind CSS  
- Firebase  

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/cocoontrack.git
cd cocoontrack
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (e.g. `cocoontrack`)
3. Enable **Authentication** → Sign-in method → **Phone**
4. Enable **Firestore Database** → Start in production mode
5. Go to Project Settings → Your Apps → Add Web App
6. Copy the config and paste it into `src/firebase/config.js`:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### 4. Deploy Firestore Security Rules
```bash
npm install -g firebase-tools
firebase login
firebase init firestore
# Copy contents of firestore.rules when prompted
firebase deploy --only firestore:rules
```

### 5. Run locally
```bash
npm start
```
App opens at `http://localhost:3000`

---

## 📦 Project Structure

```
cocoontrack/
├── public/
│   └── index.html
├── src/
│   ├── firebase/
│   │   ├── config.js        # Firebase init
│   │   └── db.js            # Firestore CRUD helpers
│   ├── context/
│   │   └── AuthContext.js   # Auth state + phone OTP
│   ├── components/
│   │   └── BottomNav.jsx    # Mobile nav bar
│   ├── pages/
│   │   ├── Login.jsx        # Phone OTP login
│   │   ├── Dashboard.jsx    # Home screen
│   │   ├── Batches.jsx      # Batch lifecycle management
│   │   ├── Monitor.jsx      # Environment monitoring
│   │   ├── Market.jsx       # Market prices
│   │   └── Sales.jsx        # Sales & income tracker
│   ├── App.jsx              # Routes + auth guard
│   ├── index.js             # Entry point
│   └── index.css            # Tailwind + global styles
├── firestore.rules          # Firestore security rules
├── vercel.json              # Vercel SPA routing fix
├── tailwind.config.js
└── package.json
```

---

## ☁️ Deploy to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Framework preset: **Create React App**
4. Add environment variables if using `.env`:
   - `REACT_APP_FIREBASE_API_KEY`
   - etc.
5. Click **Deploy**

Vercel auto-deploys on every `git push` to `main`.

---

## 🔮 Future: IoT Hardware Integration

The Monitor screen is designed to accept auto-filled readings from hardware sensors. When the hardware module (DHT22 / NodeMCU) is ready:

1. Sensor publishes data to Firebase Firestore via HTTPS
2. `src/pages/Monitor.jsx` reads from the same `envLogs` collection
3. No frontend code change needed — just plug in the hardware writer

---

## 🗃️ Firestore Database Schema

```
batches/{batchId}
  userId, name, breed, eggCount, startDate, estHarvest,
  currentStage, rearingRoom, healthStatus, status, createdAt

envLogs/{logId}
  userId, batchId, temperature, humidity, ventilation, loggedAt

batchLogs/{logId}
  userId, batchId, health, mortality, notes, loggedAt

sales/{saleId}
  userId, buyer, grade, weight, pricePerKg, total, batchId, saleDate

expenses/{expId}
  userId, category, amount, notes, date
```

---

## 👥 Team

**Modified Cocoon Project** — BE/BTech Internal Evaluation 2026

---

## 📄 License

MIT
