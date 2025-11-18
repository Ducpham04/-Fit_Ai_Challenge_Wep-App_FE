# Mock Backend Setup Guide

## 🎯 How to Test the Backend Integration

### Step 1: Install Backend Dependencies

The mock backend requires Node.js packages. Run this in PowerShell:

```powershell
npm install express cors multer --save-dev
```

### Step 2: Start the Mock Backend

```powershell
node mockBackend.js
```

You should see:
```
🚀 Mock Backend Server Started
================================
📡 Server running on: http://localhost:3001
🏥 Health check: http://localhost:3001/health
📤 Upload endpoint: POST http://localhost:3001/api/analysis/pushup
📊 Get all analyses: GET http://localhost:3001/api/analysis

💡 Waiting for video uploads...
```

### Step 3: Start Your Frontend (in a new terminal)

```powershell
npm run dev
```

### Step 4: Test the Flow

1. Open browser to `http://localhost:5173`
2. Navigate to **PushUpCounter** page
3. Upload a video (drag & drop or click to browse)
4. Click **Play**
5. Let it count to **10 reps**
6. Watch for automatic:
   - Counter lock 🔒
   - Completion notification 🎉
   - Backend submission 📤
   - Results display 📊

---

## 📄 Where to Find JSON Output

### Option 1: Terminal Output
The mock backend prints the full JSON response to the terminal:
```
✅ Analysis completed successfully
📊 Analysis ID: ana_1700310945123
📈 Results: 12 reps, 87/100 form score

📄 Full JSON Response:
{
  "success": true,
  "data": {
    "totalReps": 12,
    "duration": 45.3,
    ...
  }
}
```

### Option 2: Saved JSON Files
Each analysis is automatically saved to a file:
```
💾 Saved to: ./analysis_ana_1700310945123.json
```

**Location:** In your project root directory
- `analysis_ana_1700310945123.json`
- `analysis_ana_1700310945456.json`
- etc.

You can open these files with:
- VS Code
- Notepad
- Any text editor

### Option 3: Browser DevTools (Network Tab)
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Filter: `pushup`
4. After submission completes, click the request
5. Click **Response** tab to see JSON

### Option 4: Browser DevTools (Console)
The frontend logs the response:
```javascript
✅ Backend analysis complete: {...}
```

---

## 🔍 Example JSON Output

```json
{
  "success": true,
  "data": {
    "totalReps": 12,
    "duration": 45.3,
    "averageRepSpeed": 15.9,
    "formScore": 87,
    "repDetails": [
      {
        "repNumber": 1,
        "duration": 3.78,
        "quality": 85,
        "depthAchieved": 92,
        "timestamp": 0.0
      },
      {
        "repNumber": 2,
        "duration": 3.78,
        "quality": 88,
        "depthAchieved": 95,
        "timestamp": 3.78
      }
      // ... more reps
    ],
    "qualityMetrics": {
      "overallForm": 87,
      "consistency": 90,
      "rangeOfMotion": 92,
      "bodyAlignment": 85,
      "tempo": 89
    },
    "videoMetadata": {
      "filename": "pushup_video.mp4",
      "size": 5242880,
      "duration": 45.3,
      "resolution": "1280x720",
      "frameRate": 30
    }
  },
  "analysisId": "ana_1700310945123",
  "timestamp": "2025-11-18T10:35:45.123Z"
}
```

---

## 🛠️ Troubleshooting

### Issue: "Cannot find module 'express'"
**Solution:** Install dependencies
```powershell
npm install express cors multer --save-dev
```

### Issue: "Port 3001 already in use"
**Solution:** Kill the process or change the port
```powershell
# Change PORT in mockBackend.js
const PORT = 3002; // or any other port

# Update .env file
VITE_API_URL=http://localhost:3002/api
```

### Issue: "CORS error in browser"
**Solution:** Make sure both servers are running:
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`

### Issue: "No JSON files created"
**Solution:** Check file permissions, or look in project root folder

---

## 📊 Testing Different Scenarios

### Test 1: Normal Flow
1. Upload video
2. Count to 10 reps
3. Check terminal for JSON output
4. Verify JSON file created

### Test 2: Multiple Submissions
1. Complete test 1
2. Click reset
3. Upload new video
4. Count to 10 again
5. Check for second JSON file

### Test 3: API Endpoints

**Health Check:**
```powershell
curl http://localhost:3001/health
```

**Get All Analyses:**
```powershell
curl http://localhost:3001/api/analysis
```

**Get Specific Analysis:**
```powershell
curl http://localhost:3001/api/analysis/ana_1700310945123
```

---

## 📁 File Locations

```
your-project/
├── mockBackend.js          ← Backend server code
├── analysis_ana_*.json     ← Generated JSON files (here!)
├── uploads/                ← Uploaded video files
│   └── video_*.mp4
├── package.json
└── src/
    └── pages/
        └── PushUpCounter.tsx
```

---

## 🎓 Quick Start Commands

```powershell
# Terminal 1: Install and start backend
npm install express cors multer --save-dev
node mockBackend.js

# Terminal 2: Start frontend
npm run dev

# Open browser
# http://localhost:5173
```

---

## ✅ Verification Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 5173
- [ ] Can upload video
- [ ] Counter reaches 10 reps
- [ ] Completion notification shows
- [ ] Terminal shows JSON output
- [ ] JSON file created in project root
- [ ] Results display in UI

---

## 💡 Tips

1. **Keep terminal visible** - You'll see real-time logs
2. **Check project root** - JSON files are saved there
3. **Use VS Code** - Open JSON files to see formatted output
4. **Browser DevTools** - Network tab shows full request/response
5. **Console logs** - Check browser console for frontend logs

Happy testing! 🚀
