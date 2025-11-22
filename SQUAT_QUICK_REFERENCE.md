# Squat Challenge - Quick Reference

## 🚀 Quick Start

### Start the Application
```powershell
# Terminal 1: Start backend
node mockBackend.js

# Terminal 2: Start frontend
npm run dev
```

### Access Squat Counter
```
http://localhost:5173/#/challenges/1/squat-counter
```

---

## 📁 File Locations

```
Squat Challenge Files
├── src/src/utils/squatCounterLogic.ts       # Core logic
├── src/src/hooks/useSquatCounter.ts         # React hook
├── src/src/api/squatAnalysis.ts             # API client
├── src/src/pages/SquatCounter.tsx           # UI component
├── src/src/router/index.tsx                 # Routes
└── mockBackend.js                           # Mock server
```

---

## 🔧 Configuration

### Squat Detection Parameters
```typescript
// In squatCounterLogic.ts
Standing: avgAngle > 150°   // Legs straight
Squatting: avgAngle < 120°  // Deep squat

// Landmarks
Left:  Hip(23) → Knee(25) → Ankle(27)
Right: Hip(24) → Knee(26) → Ankle(28)
```

### Target Reps
```typescript
// In SquatCounter.tsx, line 40
const [targetReps] = useState(10);  // Change to adjust target
```

### Backend Endpoint
```typescript
// In squatAnalysis.ts
POST /api/analysis/squat
```

---

## 🎯 User Flow

```
1. Upload video (front view, both legs visible)
   ↓
2. Click ▶️ Play
   ↓
3. AI counts squats in real-time
   ↓
4. Reach 10 squats
   ↓
5. Counter locks automatically
   ↓
6. Backend submission starts
   ↓
7. Results display in sidebar
   ↓
8. Click "Reset" to start over
```

---

## 📊 Metrics Display

| Metric | Description | Icon |
|--------|-------------|------|
| Squats | Total reps counted | Activity |
| Pace | Squats per minute | TrendingUp |
| Time | Seconds elapsed | Clock |
| Knee Angle | Current angle in degrees | Gauge |
| Quality | Form score (0-100) | Award |

---

## 🧪 Testing Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 5173
- [ ] Can upload video
- [ ] Pose skeleton appears when playing
- [ ] Squats count correctly
- [ ] Knee angle updates
- [ ] Counter locks at 10 reps
- [ ] Backend submission occurs
- [ ] Results display in UI
- [ ] JSON file created in project root
- [ ] Reset button works

---

## 🐛 Common Issues

### Squats Not Counting
- ✅ Use front view (not side view)
- ✅ Ensure both legs visible
- ✅ Squat deeper (< 120°)
- ✅ Stand fully between reps (> 150°)

### Backend Not Working
- ✅ Check `node mockBackend.js` is running
- ✅ Verify port 3001 is available
- ✅ Check browser console for errors
- ✅ Ensure video file reference exists

### Pose Not Detected
- ✅ Check good lighting
- ✅ Verify MediaPipe model loaded
- ✅ Ensure full body in frame
- ✅ Check landmark visibility > 0.5

---

## 📱 API Endpoints

### Squat Analysis
```
POST   /api/analysis/squat           # Upload video
GET    /api/analysis/:id             # Get specific result
GET    /api/analysis/squat/history   # Get user history
GET    /api/analysis/squat/compare   # Compare analyses
```

### Health Check
```
GET    /health                       # Server status
```

---

## 🎨 UI Components Used

- VideoPlayer (forwardRef)
- MetricCard
- Motion (Framer Motion)
- Lucide Icons:
  - Activity, Clock, TrendingUp, Award, Gauge
  - Loader2, AlertCircle, CheckCircle
  - Lock, Send

---

## 🔍 Console Commands

### Check JSON Files
```powershell
Get-ChildItem -Filter "analysis_squat_*.json"
```

### View JSON Content
```powershell
Get-Content .\analysis_squat_ana_*.json | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### Test Backend Health
```powershell
curl http://localhost:3001/health
```

---

## 📈 Quality Score Formula

```typescript
Quality = (Consistency × 0.6) + (Depth × 0.4)

Consistency = Based on rep timing variance
Depth = Based on knee angle (target < 120°)
```

---

## 🎯 Key Differences: Push-up vs Squat

| Feature | Push-up | Squat |
|---------|---------|-------|
| View | Side | Front |
| Landmarks | Shoulder-Elbow-Wrist | Hip-Knee-Ankle |
| States | At Top / At Bottom | Standing / Squatting |
| Extra Metric | - | Knee Angle |
| Angle Type | Elbow + Body | Knee (averaged) |

---

## ⚡ Quick Tips

1. **For Best Results:**
   - Position camera directly in front
   - Stand on solid surface
   - Wear contrasting clothing
   - Ensure good lighting

2. **For Development:**
   - Use console.log for debugging
   - Check Network tab for API calls
   - Monitor backend terminal for requests
   - Inspect JSON files for detailed data

3. **For Production:**
   - Replace mock backend with real API
   - Add authentication
   - Implement progress persistence
   - Add video upload size limits

---

## 📚 Documentation Links

- Full Implementation Guide: `SQUAT_CHALLENGE_IMPLEMENTATION.md`
- Backend Integration: `PUSHUP_COUNTER_BACKEND_INTEGRATION.md`
- Mock Backend Guide: `MOCK_BACKEND_GUIDE.md`

---

## 🎉 Success Criteria

✅ All TypeScript files compile without errors  
✅ Squat counting works accurately  
✅ Backend integration functional  
✅ UI matches Push-up Counter design  
✅ Reset functionality works  
✅ Quality metrics display correctly  
✅ Documentation complete  

**Status:** ✅ READY FOR TESTING
