# Installation & Setup Guide

## 📦 Step 1: Install Dependencies

```bash
npm install
```

This will install:
- **express** - Backend API server
- **cors** - Cross-origin resource sharing
- **jest** - Testing framework
- **ts-jest** - TypeScript support for Jest
- **@testing-library/react** - React testing utilities
- All other existing dependencies

## 🚀 Step 2: Start the Application

### Option A: Run Both Servers Simultaneously (Recommended)

**Terminal 1 - Backend API:**
```bash
npm run api
```
You should see:
```
========================================
🏋️  FitAI Mock API Server
========================================
✓ Server: http://localhost:3001
✓ Health: http://localhost:3001/health
✓ Plan: http://localhost:3001/api/workout-plan
========================================
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```
You should see:
```
VITE v6.4.1  ready in 542 ms
➜  Local:   http://localhost:5173/
```

### Option B: Run Frontend Only (For Testing Without API)

If you just want to test the frontend with fallback values:
```bash
npm run dev
```

The app will use default target of 10 reps if API is unavailable.

## 🧪 Step 3: Run Tests (Optional)

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## ✅ Step 4: Verify Installation

### Check API Server
Open browser and navigate to:
```
http://localhost:3001/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-11-23T10:30:00Z",
  "version": "1.0.0"
}
```

### Check API Data
```
http://localhost:3001/api/workout-plan
```

Should return 14-day plan with targets.

### Check Frontend
1. Open http://localhost:5173
2. Navigate to "Push-Up Counter"
3. You should see "Day 1 Target: 27 push-ups" (not 10!)
4. Navigate to "Squat Counter"
5. You should see "Day 1 Target: 41 squats" (not 10!)

## 🛠️ Troubleshooting

### Port Already in Use

**Error:** `Port 3001 is already in use`

**Solution:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <process_id> /F

# Mac/Linux
lsof -i :3001
kill -9 <process_id>
```

Or change port in `mock-api-server.js`:
```javascript
const PORT = 3002; // Change to any available port
```

### Module Not Found

**Error:** `Cannot find module 'express'`

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS Error in Browser

**Error:** `Access to fetch has been blocked by CORS policy`

**Check:** Make sure mock-api-server.js has:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'OPTIONS']
}));
```

### Tests Failing

**Error:** `Cannot find module '@jest/globals'`

**Solution:**
```bash
npm install --save-dev @jest/globals @types/jest
```

## 📂 Project Structure

```
-Fit_Ai_Challenge_Wep-App_FE/
├── mock-api-server.js          # Backend mock API
├── package.json                # Dependencies & scripts
├── jest.config.json            # Test configuration
├── API_CONTRACT.md             # API documentation
├── IMPLEMENTATION_GUIDE_API.md # Complete guide
├── QUICK_REFERENCE_API.md      # Quick commands
├── src/
│   └── src/
│       ├── api/
│       │   ├── workoutPlanApi.ts      # API client
│       │   └── workoutPlanApi.test.ts # Tests
│       └── pages/
│           ├── PushUpCounter.tsx      # Updated component
│           └── SquatCounter.tsx       # Updated component
```

## 🔄 Development Workflow

1. **Make code changes** in `src/`
2. **Frontend hot-reloads** automatically (Vite)
3. **Backend requires restart** after changes:
   ```bash
   # Stop with Ctrl+C, then restart
   npm run api
   ```
4. **Run tests** to verify:
   ```bash
   npm test
   ```

## 🌐 Environment Configuration

### Development (Default)
- Uses mock API on `http://localhost:3001`
- No authentication required
- Simulated network latency

### Production (Future)
Create `.env` file:
```env
VITE_USE_MOCK_API=false
VITE_API_URL=https://api.fitai.com/api
```

Then rebuild:
```bash
npm run build
```

## 📊 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (frontend) |
| `npm run build` | Build for production |
| `npm run api` | Start mock API server (backend) |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate coverage report |

## ✨ Features Enabled

After installation, you have:

✅ **Dynamic Daily Targets**
- Day 1: 27 push-ups, 41 squats
- Day 14: 42 push-ups, 64 squats
- Fetched from API on page load

✅ **API-Driven Success Messages**
- Shows actual day number
- Shows actual target achieved
- "Day 1 completed: You've done 27 push-ups!"

✅ **Progress Tracking**
- Live progress bar
- Percentage display
- Visual feedback

✅ **Error Handling**
- Graceful fallback to default targets
- User-friendly error messages
- Network timeout handling

✅ **Testing Suite**
- Unit tests for API client
- Mock data validation
- Coverage reporting

## 🎯 Next Steps

1. **Explore the code** - See how API integration works
2. **Read the guide** - Check `IMPLEMENTATION_GUIDE_API.md`
3. **Run tests** - Verify everything works
4. **Customize** - Modify plan data in `mock-api-server.js`
5. **Deploy** - Ready for production when you are!

## 🆘 Need Help?

- **Quick commands**: See `QUICK_REFERENCE_API.md`
- **Full documentation**: See `IMPLEMENTATION_GUIDE_API.md`
- **API spec**: See `API_CONTRACT.md`
- **Test examples**: See `src/src/api/workoutPlanApi.test.ts`

---

**Happy coding! 🚀**
