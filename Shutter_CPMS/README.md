# Shutter CMS - Run Instructions

This project is divided into two parts: a **Frontend** (Next.js) and a **Backend** (Express.js).

## 🚀 Quick Start (Both macOS & Windows)

To run both the frontend and backend simultaneously from the root directory:

### **1. Install All Dependencies**
**macOS / Linux:**
```bash
npm run install:all
```
**Windows (PowerShell/CMD):**
```powershell
npm run install:all
```

### **2. Start Both Services**
**macOS / Linux:**
```bash
npm run dev
# Or manually open in Chrome:
# open -a "Google Chrome" http://localhost:3000
```
**Windows (PowerShell/CMD):**
```powershell
npm run dev
# Or manually open in Chrome:
# start chrome http://localhost:3000
```

---

## 💻 Manual Execution (Separate Terminals)

### **Backend** (Express + SQLite)
**macOS / Linux:**
```bash
cd backend
npm install
npm run dev
```
**Windows:**
```powershell
cd backend
npm install
npm run dev
```

### **Frontend** (Next.js + Tailwind)
**macOS / Linux:**
```bash
cd frontend
npm install
npm run dev
```
**Windows:**
```powershell
cd frontend
npm install
npm run dev
```

---

## 🔗 Environment Configuration

- **Frontend URL**: [http://localhost:3001](http://localhost:3001)
- **Backend API URL**: [http://localhost:5001/api](http://localhost:5001/api)
- **Database File**: Located at `backend/shutter_cms.db`
