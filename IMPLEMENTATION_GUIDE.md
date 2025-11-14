# Push-Up Counter - Quick Implementation Reference

## File Structure
```
src/src/
├── utils/
│   ├── angleUtils.ts           # Angle calculation & CounterBase
│   ├── poseDetector.ts         # MediaPipe Pose wrapper
│   ├── pushUpCounterLogic.ts  # Push-up counting logic
│   └── poseProcessor.ts        # Canvas visualization
├── hooks/
│   └── usePushUpCounter.ts     # React hook (refactored)
└── pages/
    └── PushUpCounter.tsx       # Main page component (updated)
```

## Key Classes & Functions

### 1. PoseEstimator (poseDetector.ts)
```typescript
const estimator = new PoseEstimator({
  detectionConf: 0.5,
  trackingConf: 0.5,
  modelComplexity: 1
});

estimator.onResults((results) => { /* handle results */ });
await estimator.process(videoElement);
estimator.stop();
```

### 2. PushUpCounter (pushUpCounterLogic.ts)
```typescript
const counter = new PushUpCounter();
const [count, stage, metrics] = counter.update(landmarks);
counter.reset();
```

**Returns:**
- `count`: Number of reps
- `stage`: 'up' | 'down' | 'no_pose'
- `metrics`: { elbow: number, body: number, totalTime: number }

### 3. processPoseResults (poseProcessor.ts)
```typescript
processPoseResults(
  results,           // PoseResults from MediaPipe
  canvas,           // Canvas element for drawing
  counter,          // PushUpCounter instance
  onMetricsUpdate   // Callback(metrics) => void
);
```

## Algorithm Details

### Landmark Indices
```javascript
LEFT  = [11, 13, 15, 23, 27]  // shoulder, elbow, wrist, hip, ankle
RIGHT = [12, 14, 16, 24, 28]
```

### Angle Thresholds
```javascript
UP_ELBOW   = 155°  // Arm extended (top position)
DOWN_ELBOW = 95°   // Arm bent (bottom position)
BODY_OK    = 150°  // Body straight (good form)
MIN_GAP    = 0.45s // Minimum time between reps
```

### Counting State Machine
```
Initial: stage = 'up'
         ↓
[Elbow < 95° && Body >= 150°]
         ↓
     hitBottom = true
     stage = 'down'
         ↓
[Elbow > 155° && Body >= 150° && gap > 0.45s]
         ↓
     counter++
     hitBottom = false
     stage = 'up'
```

## Hook Interface

### usePushUpCounter()
```typescript
const {
  metrics,          // PushUpMetrics
  isModelReady,     // boolean
  isProcessing,     // boolean
  error,            // string | null
  startProcessing,  // () => void
  stopProcessing,   // () => void
  resetCounter,     // () => void
  processFrame      // (video, canvas) => Promise<void>
} = usePushUpCounter();
```

### PushUpMetrics
```typescript
{
  reps: number;           // Total push-ups counted
  state: PushUpState;     // 'up' | 'down' | 'no_pose'
  pace: number;           // Reps per minute
  elapsed: number;        // Seconds elapsed
  qualityScore: number;   // 0-100 form score
  lastRepDuration: number // Milliseconds
}
```

## Canvas Visualization

### Info Panel (Top-Left)
- Exercise name
- Current stage
- Total time
- Rep count

### Pose Overlay
- Green lines: Skeleton connections
- Red dots: Joint landmarks
- Transparent overlay: Doesn't block video interaction

## Integration Example

```tsx
const PushUpCounterPage = () => {
  const hook = usePushUpCounter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (hook.isProcessing && videoRef.current && canvasRef.current) {
      const loop = async () => {
        await hook.processFrame(videoRef.current!, canvasRef.current!);
        requestAnimationFrame(loop);
      };
      loop();
    }
  }, [hook.isProcessing]);

  return (
    <div>
      <video ref={videoRef} />
      <canvas ref={canvasRef} />
      <div>Reps: {hook.metrics.reps}</div>
    </div>
  );
};
```

## Debug Tips

### Check Model Loading
```typescript
console.log('Model ready:', isModelReady);
```

### Check Landmark Detection
```typescript
estimator.onResults((results) => {
  console.log('Landmarks:', results.poseLandmarks?.length);
});
```

### Check Angle Calculations
```typescript
const [count, stage, metrics] = counter.update(landmarks);
console.log('Elbow:', metrics.elbow, 'Body:', metrics.body);
```

### Check Form Requirements
```typescript
// Elbow should go from >155° to <95° then back to >155°
// Body should stay >= 150° throughout
```

## Performance Optimization

### Frame Processing
- Canvas updates automatically match video dimensions
- RequestAnimationFrame syncs with browser refresh rate
- Only processes when video is playing

### Memory Management
- Pose estimator cleanup on unmount
- Canvas context reused (not recreated)
- EMA reduces computational overhead

## Common Issues & Solutions

### Issue: No pose detected
**Solution**: Ensure full body is visible in frame with good lighting

### Issue: Counts don't increment
**Solution**: Check body angle >= 150° and elbow range 95° to 155°

### Issue: Canvas not showing
**Solution**: Verify canvas ref is set and isProcessing is true

### Issue: Multiple counts per rep
**Solution**: MIN_GAP (0.45s) prevents this, check if time is resetting

## Extending to Other Exercises

The pattern is reusable for other exercises:

```typescript
// Create new counter class
export class SquatCounter extends CounterBase {
  update(landmarks) {
    // Calculate knee and hip angles
    // Implement squat-specific logic
    return [count, stage, metrics];
  }
}

// Use same PoseEstimator and processPoseResults
// Only swap the counter instance
```

## References

- MediaPipe Pose: https://google.github.io/mediapipe/solutions/pose
- Original FitAI implementation: `d:\AWS\FitAI\src\exercises\pushup.js`
- Angle calculation: `d:\AWS\FitAI\src\app\angle_utils.js`

---

**Last Updated**: November 12, 2025
