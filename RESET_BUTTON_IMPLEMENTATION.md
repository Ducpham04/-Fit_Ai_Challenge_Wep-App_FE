# Reset Button Implementation - Dual-Action Functionality

## Overview
This document describes the implementation of a **dual-action Reset Button** that simultaneously:
1. **Resets all application metrics** to their initial default values
2. **Reloads the video player** to start from the beginning

## Architecture

### Component Hierarchy
```
PushUpCounter (Parent)
├── VideoPlayer (Child with exposed ref)
└── MetricCard (Display components)
```

### Data Flow
```
User Click → handleReset() → [resetCounter() + resetVideo()]
                              ↓                ↓
                         Reset Metrics    Reset Video
```

---

## Implementation Details

### 1. VideoPlayer Component (`VideoPlayer.tsx`)

#### Added TypeScript Interface for Ref
```typescript
export interface VideoPlayerRef {
  resetVideo: () => void;
}
```

#### Converted to forwardRef Component
```typescript
export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(({
  onVideoLoad,
  onVideoError,
  onPlayStateChange,
  className = '',
}, ref) => {
  // ... component logic
});
```

#### Exposed resetVideo Method via useImperativeHandle
```typescript
// Expose reset method to parent via ref
useImperativeHandle(ref, () => ({
  resetVideo: handleReset,
}), [handleReset]);
```

The `handleReset` method already existed and performs:
- Resets video `currentTime` to 0
- Pauses the video
- Updates playback state
- Notifies parent via `onPlayStateChange`

---

### 2. PushUpCounter Component (`PushUpCounter.tsx`)

#### Added VideoPlayer Ref
```typescript
const videoPlayerRef = useRef<VideoPlayerRef>(null);
```

#### Implemented Dual-Action Reset Handler
```typescript
// Dual-action reset handler: Reset metrics AND reload video
const handleReset = useCallback(() => {
  // 1. Reset all metrics to initial values
  resetCounter();
  
  // 2. Reload/reset the video to beginning
  if (videoPlayerRef.current) {
    videoPlayerRef.current.resetVideo();
  }
}, [resetCounter]);
```

#### Updated VideoPlayer to Accept Ref
```typescript
<VideoPlayer
  ref={videoPlayerRef}
  onVideoLoad={handleVideoLoad}
  onVideoError={handleVideoError}
  onPlayStateChange={handlePlayStateChange}
  className="mb-4"
/>
```

#### Updated Reset Button
```typescript
<button
  onClick={handleReset}
  disabled={metrics.reps === 0}
  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  title="Reset metrics and reload video"
>
  Reset
</button>
```

---

### 3. Hook Integration (`usePushUpCounter.ts`)

The existing `resetCounter` function handles metric reset:

```typescript
const resetCounter = useCallback(() => {
  // Reset the push-up counter logic
  if (counterRef.current) {
    counterRef.current.reset();
  }
  
  // Reset timing references
  startTimeRef.current = null;
  lastRepTimeRef.current = null;
  repTimesRef.current = [];
  
  // Reset all metrics to initial state
  setMetrics({
    reps: 0,
    state: 'no_pose',
    pace: 0,
    elapsed: 0,
    qualityScore: 0,
    lastRepDuration: 0,
  });
}, []);
```

---

## Execution Flow

### When User Clicks Reset Button:

```
1. handleReset() is invoked
   │
   ├─→ 2. resetCounter() executes
   │   ├─→ Resets push-up counter logic
   │   ├─→ Clears timing references
   │   └─→ Sets all metrics to initial values:
   │       • reps: 0
   │       • state: 'no_pose'
   │       • pace: 0
   │       • elapsed: 0
   │       • qualityScore: 0
   │       • lastRepDuration: 0
   │
   └─→ 3. videoPlayerRef.current.resetVideo() executes
       ├─→ Sets video currentTime to 0
       ├─→ Pauses video playback
       ├─→ Updates internal video state
       └─→ Triggers onPlayStateChange(false)
           └─→ Stops pose processing
```

---

## State Management

### Metrics State (Before Reset)
```typescript
{
  reps: 25,
  state: 'down',
  pace: 12.5,
  elapsed: 120,
  qualityScore: 85,
  lastRepDuration: 2400
}
```

### Metrics State (After Reset)
```typescript
{
  reps: 0,
  state: 'no_pose',
  pace: 0,
  elapsed: 0,
  qualityScore: 0,
  lastRepDuration: 0
}
```

### Video State (Before Reset)
```typescript
{
  currentTime: 45.3,
  isPlaying: true,
  playbackRate: 1
}
```

### Video State (After Reset)
```typescript
{
  currentTime: 0,
  isPlaying: false,
  playbackRate: 1  // maintained
}
```

---

## Key Features

### 1. **Synchronous Execution**
Both actions execute in sequence within the same function call, ensuring atomic behavior.

### 2. **Safe Null Checking**
```typescript
if (videoPlayerRef.current) {
  videoPlayerRef.current.resetVideo();
}
```
Prevents errors if ref is not yet initialized.

### 3. **Disabled State**
Button is disabled when `metrics.reps === 0`, preventing unnecessary resets.

### 4. **Accessible Design**
- Clear button title: "Reset metrics and reload video"
- Proper ARIA attributes
- Visual feedback (disabled state)

### 5. **Performance Optimized**
- Uses `useCallback` to prevent unnecessary re-renders
- Minimal dependency arrays
- Efficient state updates

---

## Testing Scenarios

### Test Case 1: Normal Reset
**Given:** Video is playing with metrics accumulated  
**When:** User clicks Reset button  
**Then:** 
- All metrics reset to 0
- Video rewinds to start
- Video pauses
- Processing stops

### Test Case 2: Reset When Disabled
**Given:** No reps counted (metrics.reps === 0)  
**When:** User attempts to click Reset button  
**Then:** 
- Button is disabled
- No action occurs

### Test Case 3: Reset Without Video
**Given:** No video loaded  
**When:** Reset is triggered  
**Then:** 
- Metrics reset successfully
- No video errors occur (safe null check)

### Test Case 4: Multiple Resets
**Given:** Video and metrics in any state  
**When:** User clicks Reset multiple times  
**Then:** 
- Each reset brings to initial state
- No memory leaks
- State remains consistent

---

## Code Quality

### TypeScript Safety
- ✅ Strongly typed ref interface
- ✅ Type-safe callback signatures
- ✅ Proper generic typing for forwardRef

### React Best Practices
- ✅ Uses `forwardRef` for ref forwarding
- ✅ Uses `useImperativeHandle` for controlled API exposure
- ✅ Uses `useCallback` for memoization
- ✅ Proper dependency arrays

### Error Handling
- ✅ Null/undefined checks before method calls
- ✅ Graceful degradation if video not loaded
- ✅ Safe state updates

---

## Future Enhancements

### Potential Improvements:
1. **Confirmation Dialog**: Add optional confirmation before reset for videos with many reps
2. **Animation**: Add visual feedback during reset (e.g., brief fade or pulse)
3. **Analytics**: Track reset button usage for UX insights
4. **Keyboard Shortcut**: Add keyboard shortcut (e.g., `Ctrl+R` or `Cmd+R`)
5. **Undo Functionality**: Store previous state to allow undo after reset

---

## API Reference

### VideoPlayerRef Interface
```typescript
interface VideoPlayerRef {
  resetVideo: () => void;
}
```

### handleReset Function
```typescript
const handleReset: () => void
```
**Description**: Performs dual-action reset of metrics and video  
**Side Effects**:
- Resets all application metrics
- Resets video to beginning
- Stops video playback
- Stops pose processing

**Dependencies**: `[resetCounter]`

---

## Summary

The Reset Button implementation provides a clean, type-safe way to simultaneously reset both application state and media playback. By leveraging React's `forwardRef` and `useImperativeHandle` hooks, we maintain component encapsulation while exposing only the necessary API to the parent component.

This dual-action approach ensures consistency across the application state and provides users with a single, intuitive control for starting fresh.
