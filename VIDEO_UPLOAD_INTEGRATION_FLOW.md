# Complete Video Upload Integration Flow

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    My Challenge Page                            │
│                  (Selected Training Plans)                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    User Clicks Challenge
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              Training Plan Detail Page                           │
│         (Shows Challenges by Day)                                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    User Clicks Challenge
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│            Challenge Detail Modal (Tabbed)                      │
│                                                                   │
│  Tab 1: Challenge Info          Tab 2: AI Rep Counter           │
│  - Challenge Stats              - Upload Video                   │
│  - Description                  - Analyze with AI                │
│  - Guidance Video               - View Results                   │
│  - Prior Results                                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    User Uploads Video
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  AIRepCounter Component                          │
│                                                                   │
│  1. File Selection & Validation                                  │
│  2. Upload to Backend (POST)                                     │
│  3. Poll for Analysis (GET) [if async]                          │
│  4. Display Results                                              │
│  5. Update Challenge Status (PATCH)                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## State Flow Diagram

```
User Selects Video File
        │
        ▼
┌─────────────────────────┐
│ File Validation         │
│ - Type check            │
│ - Size check (< 100MB)  │
│ - Preview generation    │
└────────┬────────────────┘
         │
         ▼ Valid
┌─────────────────────────┐
│ Show File & "Analyze"   │
│ Button becomes enabled  │
└────────┬────────────────┘
         │
         ▼ User clicks Analyze
┌─────────────────────────────────────────────────────┐
│ Submit Video (POST /api/.../submitVideo)            │
│ - FormData with video file                          │
│ - trainingPlanId & challengeId in URL               │
│ - Show "Analyzing..." spinner                       │
└────────┬────────────────────────────────────────────┘
         │
         ├─ Response: analysisStatus = "COMPLETED"
         │  └─ Use aiAnalysis directly
         │
         └─ Response: analysisStatus = "PROCESSING"
            └─ Poll (GET /api/.../submission/{id}/status)
               └─ Repeat every 1 second
               └─ Timeout after 30 attempts

         ▼ Analysis Complete
┌─────────────────────────────────────────────────────┐
│ Update Challenge Status (PATCH /api/.../status)     │
│ - Set status to "COMPLETED"                         │
└────────┬────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Display Results         │
│ - Correct Reps          │
│ - Accuracy %            │
│ - Form Score %          │
│ - Posture & Feedback    │
│ - CSV Export Option     │
│ - Video Playback        │
└─────────────────────────┘
```

---

## API Call Sequence

### Step 1: Submit Video
```
POST /api/user/training/5/challenge/123/submitVideo
Content-Type: multipart/form-data

Headers:
  Authorization: Bearer {jwt_token}
  
Body:
  video: <binary video file>
  fileName: "pushups.mp4"
  fileSize: "45000000"
  fileType: "video/mp4"

Response:
  {
    "success": true,
    "data": {
      "submissionId": "sub-abc123",
      "videoUrl": "s3://bucket/sub-abc123.mp4",
      "analysisStatus": "PROCESSING",
      "aiAnalysis": null,
      "message": "Video received, processing..."
    }
  }
```

### Step 2: Poll for Analysis (if PROCESSING)
```
GET /api/user/training/submission/sub-abc123/status

Response (first attempt):
  {
    "success": true,
    "data": {
      "submissionId": "sub-abc123",
      "analysisStatus": "PROCESSING",
      "aiAnalysis": null
    }
  }

Response (final - after ~2-3 seconds):
  {
    "success": true,
    "data": {
      "submissionId": "sub-abc123",
      "analysisStatus": "COMPLETED",
      "aiAnalysis": {
        "correctReps": 15,
        "totalReps": 15,
        "accuracy": 0.92,
        "feedback": "Excellent form!",
        "posture": "Excellent",
        "formScore": 0.88,
        "isPassed": true,
        "confidence": 0.95,
        "processingTime": 2500
      }
    }
  }
```

### Step 3: Update Challenge Status
```
PATCH /api/user/training/5/challenge/123/status
Content-Type: application/json

Headers:
  Authorization: Bearer {jwt_token}

Body:
  {
    "status": "COMPLETED"
  }

Response:
  {
    "success": true,
    "message": "Challenge status updated to COMPLETED"
  }
```

---

## Component Props Flow

### AIRepCounter Props
```typescript
interface AIRepCounterProps {
  targetReps: number;              // e.g., 15
  targetSets: number;              // e.g., 3
  challengeName: string;           // e.g., "Push-ups"
  challengeId: number;             // Challenge ID from backend
  trainingPlanId: number | string; // Training Plan ID from backend
  onAnalysisComplete: (analysis: AIAnalysisResult) => void;
  isLoading?: boolean;
}
```

### Analysis Result Flow
```typescript
interface AIAnalysisResult {
  correctReps: number;       // 15
  totalReps: number;         // 15
  accuracy: number;          // 0.92 (92%)
  feedback: string;          // "Great form!"
  posture: string;           // "Excellent"
  formScore: number;         // 0.88 (88%)
  isPassed: boolean;         // true
  videoUrl: string;          // Video preview URL
  confidence?: number;       // 0.95 (95% confidence)
  processingTime?: number;   // 2500ms
}
```

---

## Error Handling Flow

```
User Uploads Video
        │
        ▼
Try to Submit
        │
    ┌───┴───┬──────┬──────────┬─────────────┐
    │       │      │          │             │
    ▼       ▼      ▼          ▼             ▼
Network  File  Auth  Server   Timeout    Unknown
Error    Error Error  Error   Error      Error
    │       │    │      │       │          │
    └───────┴────┴──────┴───────┴──────────┘
            │
            ▼
Display Error Message:
- "Failed to connect to server"
- "Invalid file format"
- "Authentication failed"
- "Server error occurred"
- "Analysis timeout"
- "Unknown error"

User Options:
1. Try again
2. Select different file
3. Re-authenticate
4. Contact support
```

---

## Component Integration Checklist

### Before Submission to Backend:
- [ ] File is valid (MP4, WebM, MOV)
- [ ] File size < 100MB
- [ ] trainingPlanId is valid number
- [ ] challengeId is valid number
- [ ] User is authenticated (JWT token)

### During Upload:
- [ ] Show progress indicator
- [ ] Disable buttons during upload
- [ ] Log upload progress
- [ ] Set timeout (30 seconds)

### After Upload:
- [ ] Parse response correctly
- [ ] Check analysisStatus field
- [ ] If PROCESSING: start polling
- [ ] If COMPLETED: display results
- [ ] If ERROR: show error message

### Results Display:
- [ ] Format accuracy as percentage
- [ ] Format formScore as percentage
- [ ] Show correct/total reps
- [ ] Display pass/fail status clearly
- [ ] Show AI feedback
- [ ] Play video on demand

### Challenge Update:
- [ ] Send PATCH request with "COMPLETED" status
- [ ] Handle update success/failure
- [ ] Don't block UI if status update fails
- [ ] Log completion

---

## Testing Scenarios

### Scenario 1: Happy Path
```
1. User selects valid video (10 MB)
2. API returns immediately with COMPLETED status
3. Results display within 2 seconds
4. Challenge status updated
5. User sees success ✓
```

### Scenario 2: Async Processing
```
1. User selects valid video (50 MB)
2. API returns with PROCESSING status
3. Component polls every 1 second
4. After 2-3 seconds: COMPLETED status received
5. Results display
6. Challenge status updated
7. User sees results after 5 seconds total
```

### Scenario 3: Network Error
```
1. User selects video
2. Submit fails (network timeout)
3. Error message shown: "Failed to connect"
4. User can retry or select different file
5. After retry: success
```

### Scenario 4: Invalid File
```
1. User selects text file (.txt)
2. Client validation catches error
3. Error message: "Please select a video file"
4. User selects correct file
5. Upload succeeds
```

### Scenario 5: Large File
```
1. User selects 200 MB video
2. Client validation catches error
3. Error message: "Video too large (max 100MB)"
4. User compresses video
5. Upload succeeds
```

---

## Performance Metrics

### Current (Mock):
- Upload preview generation: < 100ms
- Mock analysis delay: 2-4 seconds
- Results display: instant
- Total time: ~4 seconds

### Expected (Real API):
- Upload: 2-10 seconds (depends on file size & connection)
- Analysis: 2-5 seconds (depends on ML model)
- Status update: < 1 second
- Results display: instant
- **Total time: 5-15 seconds**

---

## File Structure

```
src/features/myChallenge/
├── api/
│   ├── myChallengeService.ts          (Existing: Training plans)
│   └── videoSubmission.service.ts      (NEW: Video upload)
│
├── components/
│   ├── AIRepCounter.tsx                (UPDATED: Props for API)
│   ├── ChallengeDetailModal.tsx        (UPDATED: Pass trainingPlanId)
│   ├── ChallengeCard.tsx
│   └── ...
│
├── pages/
│   ├── MyChallengePage.tsx            (UPDATED: Type fix)
│   └── TrainingPlanDetailPage.tsx     (UPDATED: Pass trainingPlanId)
│
├── types/
│   └── myChallenge.type.ts
│
├── QUICK_API_REFERENCE.ts             (NEW: Quick integration guide)
├── REAL_API_INTEGRATION_GUIDE.md       (NEW: Detailed guide)
└── ...
```

---

## Quick Start for Real API

### 1. Find the mock handleAnalyze function in AIRepCounter.tsx
### 2. Copy the real implementation from QUICK_API_REFERENCE.ts
### 3. Update the imports to include videoSubmission service
### 4. Test with backend

**Time to integrate: ~10 minutes**

---

## Debugging Guide

### Check Console Logs
```javascript
// When user clicks "Analyze":
🎬 Submitting video for analysis:
   Training Plan ID: 5
   Challenge ID: 123
   File: pushups.mp4
   File Size: 45.32 MB

// During upload:
   Upload Progress: 25%
   Upload Progress: 50%
   Upload Progress: 100%

// After upload:
✅ Video submission response: {...}

// If polling:
⏳ Polling for analysis... (1/30)
⏳ Polling for analysis... (2/30)
✅ Analysis completed after 2 attempts

// Final result:
✅ AI Analysis Complete:
   correctReps: 15
   accuracy: 92.0%
   formScore: 88.0%
   isPassed: true
   processingTime: 2450ms
```

### Check Network Tab (DevTools)
1. Open DevTools → Network tab
2. Filter by XHR/Fetch
3. Should see:
   - POST to `/api/user/training/{id}/challenge/{id}/submitVideo`
   - GET to `/api/user/training/submission/{id}/status` (if polling)
   - PATCH to `/api/user/training/{id}/challenge/{id}/status`

### Check Response Format
- POST should return `{ success: true, data: { submissionId, analysisStatus, aiAnalysis? } }`
- GET should return same format with status updates
- PATCH should return `{ success: true, message: "..." }`

---

## Common Issues

### Issue: "trainingPlanId is undefined"
**Solution:** Check prop is being passed from TrainingPlanDetailPage to ChallengeDetailModal to AIRepCounter

### Issue: "File upload hangs"
**Solution:** Check Content-Type header is "multipart/form-data"

### Issue: "Analysis results don't display"
**Solution:** Check response includes `aiAnalysis` object with all required fields

### Issue: "Polling never completes"
**Solution:** Check GET endpoint returns correct format with `analysisStatus` field

---

## Next Steps

1. ✅ UI Components complete
2. ✅ Mock implementation working
3. ✅ Service layer ready
4. ⏳ **Connect to real backend API**
5. ⏳ Test with actual ML model
6. ⏳ Deploy to production

See `REAL_API_INTEGRATION_GUIDE.md` for detailed instructions!
