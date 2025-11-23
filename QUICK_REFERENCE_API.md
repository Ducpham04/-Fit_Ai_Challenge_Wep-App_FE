# FitAI Dynamic Workout Plan - Quick Reference

## 🚀 Quick Start

```bash
# Terminal 1: Start mock API server
npm run api

# Terminal 2: Start frontend
npm run dev

# Terminal 3: Run tests
npm test
```

## 📁 Key Files Created/Modified

### New Files
- `API_CONTRACT.md` - REST API specification
- `mock-api-server.js` - Express mock backend
- `src/src/api/workoutPlanApi.ts` - API client service
- `src/src/api/workoutPlanApi.test.ts` - Unit tests
- `jest.config.json` - Jest configuration
- `jest.setup.js` - Test environment setup
- `IMPLEMENTATION_GUIDE_API.md` - Complete documentation

### Modified Files
- `src/src/pages/PushUpCounter.tsx` - Added API integration
- `src/src/pages/SquatCounter.tsx` - Added API integration
- `package.json` - Added testing dependencies and scripts

## 🔑 Key Changes

### Before
```typescript
const [targetReps] = useState(10); // ❌ Hard-coded
```

### After
```typescript
// ✅ Fetched from API
useEffect(() => {
  const target = await workoutPlanApi.getCurrentDayTarget('intermediate');
  setTargetReps(target.pushUps); // Day 1 = 27
}, []);
```

## 📊 14-Day Plan Data

| Day | Push-ups | Squats | Jumping Jacks | Plank (s) |
|-----|----------|--------|---------------|-----------|
| 1   | 27       | 41     | 128           | 47        |
| 2   | 28       | 42     | 132           | 49        |
| 3   | 29       | 44     | 137           | 50        |
| 4   | 30       | 45     | 142           | 52        |
| 5   | 31       | 47     | 147           | 54        |
| 6   | 32       | 49     | 152           | 56        |
| 7   | 33       | 50     | 157           | 58        |
| 8   | 34       | 52     | 163           | 60        |
| 9   | 36       | 54     | 169           | 62        |
| 10  | 37       | 56     | 174           | 64        |
| 11  | 38       | 58     | 181           | 66        |
| 12  | 39       | 60     | 187           | 69        |
| 13  | 41       | 62     | 193           | 71        |
| 14  | 42       | 64     | 200           | 74        |

## 🌐 API Endpoints

### Get Full Plan
```
GET http://localhost:3001/api/workout-plan?type=intermediate&days=14
```

### Get Specific Day
```
GET http://localhost:3001/api/workout-plan/day/1?type=intermediate
```

## 💻 Usage in Components

### Fetch Daily Target
```typescript
import { workoutPlanApi } from '../api/workoutPlanApi';

// In component
const [targetReps, setTargetReps] = useState(10);
const [currentDay, setCurrentDay] = useState(1);

useEffect(() => {
  const fetchTarget = async () => {
    try {
      const target = await workoutPlanApi.getCurrentDayTarget('intermediate');
      setTargetReps(target.pushUps); // or target.squats
      setCurrentDay(target.day);
    } catch (error) {
      console.error('Failed to fetch target:', error);
      // Fallback to default
      setTargetReps(10);
    }
  };
  
  fetchTarget();
}, []);
```

### Display Success Message
```typescript
{isCompleted && (
  <div>
    <h3>🎉 Day {currentDay} Completed!</h3>
    <p>You've done {targetReps} push-ups!</p>
  </div>
)}
```

## 🔄 Switch API Mode

### Programmatic
```typescript
import { workoutPlanApi } from './api/workoutPlanApi';

// Use production API
workoutPlanApi.config.setUseMockApi(false);
```

### Environment Variable
Create `.env`:
```env
VITE_USE_MOCK_API=false
VITE_API_URL=https://api.fitai.com/api
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run with Coverage
```bash
npm run test:coverage
```

### Test Example
```typescript
it('should fetch day 1 target of 27 push-ups', async () => {
  const target = await workoutPlanApi.getDayTarget(1, 'intermediate');
  expect(target.pushUps).toBe(27);
});
```

## ✅ Verification

1. **API Server Running?**
   ```bash
   curl http://localhost:3001/health
   # Should return: {"status":"ok"}
   ```

2. **Frontend Fetching Data?**
   - Open DevTools → Network tab
   - Look for call to `/api/workout-plan`
   - Check console for: `✅ Daily target loaded: Day 1 - 27 push-ups`

3. **Correct Target Displayed?**
   - Push-up page shows "Day 1 Target: 27 push-ups" (not 10)
   - Squat page shows "Day 1 Target: 41 squats" (not 10)

## 🐛 Common Issues

### "Failed to fetch daily target"
→ Make sure mock API is running: `npm run api`

### CORS Error
→ Check mock-api-server.js has correct origin: `http://localhost:5173`

### Still showing 10 reps
→ Clear browser cache and reload

## 📦 Dependencies Added

```json
{
  "dependencies": {
    "express": "^5.1.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@jest/globals": "^29.7.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "@testing-library/react": "^14.1.2"
  }
}
```

## 🎯 Success Criteria

- ✅ Mock API returns 14-day plan
- ✅ Frontend fetches daily target on mount
- ✅ Success message shows dynamic day and reps
- ✅ Progress bar uses API target
- ✅ Both push-up and squat pages work
- ✅ Tests pass
- ✅ Can switch to production API

## 📚 Documentation

- **Full Guide**: `IMPLEMENTATION_GUIDE_API.md`
- **API Spec**: `API_CONTRACT.md`
- **Tests**: `src/src/api/workoutPlanApi.test.ts`

---

**Need help?** See `IMPLEMENTATION_GUIDE_API.md` for detailed explanations.
